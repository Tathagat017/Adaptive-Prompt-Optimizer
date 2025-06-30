# Adaptive Prompt Optimizer

A tool that optimizes prompts for specific AI coding tools (Copilot, Cursor, Replit) using OpenAI GPT-3.5 Turbo and LangChain.
![image](https://github.com/user-attachments/assets/e3e99322-705b-4964-bd3f-60869e7c80e6)
![image](https://github.com/user-attachments/assets/1d901ba4-069e-4b7a-a7b8-68865bc7778e)

## Features

- **Multi-Tool Support**: Optimize prompts for Copilot, Cursor, and Replit
- **Tool-Specific Optimization**: Uses system prompts and tools context for each AI assistant
- **Before/After Comparison**: Clear visualization of optimization improvements
- **Modern UI**: Beautiful interface built with Mantine UI components
- **Real-time Analysis**: Detailed explanations of optimizations made

## Architecture

### Backend

- **FastAPI**: High-performance Python web framework
- **LangChain**: Integration with OpenAI GPT-3.5 Turbo
- **System Context**: Uses actual system prompts and tools from each AI assistant

### Frontend

- **React 18**: Modern React with TypeScript
- **Mantine UI**: Beautiful and accessible component library
- **Responsive Design**: Works on desktop and mobile devices

## Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js 16+
- OpenAI API Key

### 1. Environment Setup

Create a `.env` file in the root directory:

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the backend server
python main.py
```

The backend will be available at `http://localhost:8000`

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend will be available at `http://localhost:3000`

## Usage

1. **Select Target Tool**: Choose from Copilot, Cursor, or Replit
2. **Enter Prompt**: Input your original prompt in the text area
3. **Optimize**: Click "Optimize Prompt" to process your prompt
4. **Review Results**: See the optimized prompt, explanations, and improvements

## API Endpoints

### GET `/tools`

Returns available AI tools with their descriptions and capabilities.

### POST `/optimize`

Optimizes a prompt for the specified target tool.

**Request Body:**

```json
{
  "prompt": "Your original prompt",
  "target_tool": "cursor"
}
```

**Response:**

```json
{
  "original_prompt": "...",
  "optimized_prompt": "...",
  "target_tool": "cursor",
  "optimizations_made": ["..."],
  "explanation": "..."
}
```

## Tool-Specific Optimizations

### Copilot

- Focuses on conversational style and engagement
- Optimizes for information gathering and debate
- Emphasizes human-like interaction patterns

### Cursor

- Optimizes for code-focused tasks
- Leverages available tools and capabilities
- Structured for pair programming scenarios

### Replit

- Optimizes for complete project generation
- Focuses on deployable applications
- Emphasizes directory structure and file organization

## Development

### Project Structure

```
├── backend/
│   ├── copilot/
│   │   └── system_prompt.txt
│   ├── cursor/
│   │   ├── system_prompt.txt
│   │   └── system_tools.txt
│   ├── replit/
│   │   ├── system_prompt.txt
│   │   └── system_tool.txt
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── types/
│   │   └── ...
│   └── package.json
└── README.md
```

### Adding New Tools

1. Create a new directory in `backend/` with the tool name
2. Add `system_prompt.txt` (and optionally `system_tools.txt`)
3. Update the tools list in `backend/main.py`
4. Test the optimization with the new tool

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Troubleshooting

### Common Issues

1. **OpenAI API Key Error**: Ensure your API key is valid and has sufficient credits
2. **CORS Issues**: Make sure the backend is running on port 8000
3. **Module Import Errors**: Verify all dependencies are installed correctly

### Getting Help

- Check the console logs for detailed error messages
- Ensure all environment variables are set correctly
- Verify API endpoints are accessible

## Acknowledgments

- OpenAI for providing the GPT-3.5 Turbo API
- LangChain for the AI integration framework
- Mantine for the beautiful UI components
- FastAPI for the high-performance backend framework
