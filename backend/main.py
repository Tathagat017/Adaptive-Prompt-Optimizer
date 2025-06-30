from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional
import os
from pathlib import Path
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Adaptive Prompt Optimizer", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI client
openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    raise ValueError("OPENAI_API_KEY environment variable is required")

llm = ChatOpenAI(
    model_name="gpt-3.5-turbo",
    temperature=0.7,
    openai_api_key=openai_api_key
)

class OptimizeRequest(BaseModel):
    prompt: str
    target_tool: str  # "copilot", "cursor", "replit"

class OptimizationResponse(BaseModel):
    original_prompt: str
    optimized_prompt: str
    target_tool: str
    optimizations_made: List[str]
    explanation: str

class ToolInfo(BaseModel):
    name: str
    description: str
    has_tools: bool

def load_system_content(tool_name: str) -> Dict[str, str]:
    """Load system prompt and tools for a specific tool"""
    base_path = Path(__file__).parent
    
    # Load system prompt
    prompt_file = base_path / tool_name / "system_prompt.txt"
    tools_file = base_path / tool_name / "system_tools.txt" if tool_name != "copilot" else None
    
    content = {}
    
    try:
        with open(prompt_file, 'r', encoding='utf-8') as f:
            content['system_prompt'] = f.read()
    except FileNotFoundError:
        logger.error(f"System prompt file not found for {tool_name}")
        raise HTTPException(status_code=404, detail=f"System prompt not found for {tool_name}")
    
    if tools_file and tools_file.exists():
        try:
            with open(tools_file, 'r', encoding='utf-8') as f:
                content['system_tools'] = f.read()
        except FileNotFoundError:
            logger.warning(f"System tools file not found for {tool_name}")
            content['system_tools'] = ""
    else:
        content['system_tools'] = ""
    
    return content

def create_optimization_prompt(user_prompt: str, tool_name: str, system_content: Dict[str, str]) -> str:
    """Create the optimization prompt for LangChain"""
    
    base_optimization_prompt = f"""
You are an expert at optimizing prompts for AI coding assistants. Your task is to optimize the given user prompt for the {tool_name.upper()} coding assistant.

TARGET TOOL: {tool_name.upper()}

SYSTEM PROMPT CONTEXT:
{system_content['system_prompt']}

AVAILABLE TOOLS CONTEXT:
{system_content.get('system_tools', 'No specific tools available for this assistant.')}

USER'S ORIGINAL PROMPT:
{user_prompt}

Your task is to optimize this prompt to work better with {tool_name.upper()} by:

1. **Clarity and Specificity**: Make the prompt more clear and specific
2. **Tool-Specific Language**: Use language and terminology that aligns with {tool_name}'s capabilities
3. **Context Optimization**: Structure the prompt to provide better context for the AI
4. **Action-Oriented**: Make the prompt more actionable and concrete
5. **Best Practices**: Apply {tool_name}-specific best practices

Please provide:
1. An optimized version of the prompt
2. A list of specific optimizations made (as bullet points)
3. A brief explanation of why these optimizations work well for {tool_name}

Format your response as:
OPTIMIZED_PROMPT:
[Your optimized prompt here]

OPTIMIZATIONS_MADE:
- [optimization 1]
- [optimization 2]
- [etc.]

EXPLANATION:
[Brief explanation of why these optimizations work for {tool_name}]
"""
    
    return base_optimization_prompt

@app.get("/")
async def root():
    return {"message": "Adaptive Prompt Optimizer API"}

@app.get("/tools", response_model=List[ToolInfo])
async def get_available_tools():
    """Get list of available tools for optimization"""
    tools = [
        ToolInfo(
            name="copilot",
            description="Microsoft Copilot - AI companion for conversations and assistance",
            has_tools=False
        ),
        ToolInfo(
            name="cursor",
            description="Cursor - AI-powered code editor with advanced tools",
            has_tools=True
        ),
        ToolInfo(
            name="replit",
            description="Replit - Online IDE with collaborative coding features",
            has_tools=True
        )
    ]
    return tools

@app.post("/optimize", response_model=OptimizationResponse)
async def optimize_prompt(request: OptimizeRequest):
    """Optimize a prompt for the specified target tool"""
    
    if request.target_tool not in ["copilot", "cursor", "replit"]:
        raise HTTPException(
            status_code=400, 
            detail="Invalid target tool. Must be one of: copilot, cursor, replit"
        )
    
    try:
        # Load system content for the target tool
        system_content = load_system_content(request.target_tool)
        
        # Create optimization prompt
        optimization_prompt = create_optimization_prompt(
            request.prompt, 
            request.target_tool, 
            system_content
        )
        
        # Call OpenAI via LangChain
        messages = [
            SystemMessage(content="You are an expert prompt optimizer for AI coding assistants."),
            HumanMessage(content=optimization_prompt)
        ]
        
        response = llm(messages)
        response_text = response.content
        
        # Parse the response
        optimized_prompt = ""
        optimizations_made = []
        explanation = ""
        
        sections = response_text.split("OPTIMIZED_PROMPT:")
        if len(sections) > 1:
            remaining = sections[1]
            
            opt_sections = remaining.split("OPTIMIZATIONS_MADE:")
            if len(opt_sections) > 1:
                optimized_prompt = opt_sections[0].strip()
                remaining = opt_sections[1]
                
                exp_sections = remaining.split("EXPLANATION:")
                if len(exp_sections) > 1:
                    optimizations_text = exp_sections[0].strip()
                    explanation = exp_sections[1].strip()
                    
                    # Parse optimizations
                    for line in optimizations_text.split('\n'):
                        line = line.strip()
                        if line.startswith('-') or line.startswith('•'):
                            optimizations_made.append(line[1:].strip())
        
        # Fallback if parsing fails
        if not optimized_prompt:
            optimized_prompt = response_text
            optimizations_made = ["General optimization applied"]
            explanation = f"Prompt optimized for {request.target_tool} based on its system capabilities."
        
        return OptimizationResponse(
            original_prompt=request.prompt,
            optimized_prompt=optimized_prompt,
            target_tool=request.target_tool,
            optimizations_made=optimizations_made,
            explanation=explanation
        )
        
    except Exception as e:
        logger.error(f"Error optimizing prompt: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to optimize prompt: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 