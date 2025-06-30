export interface OptimizeRequest {
  prompt: string;
  target_tool: string;
}

export interface OptimizationResponse {
  original_prompt: string;
  optimized_prompt: string;
  target_tool: string;
  optimizations_made: string[];
  explanation: string;
}

export interface ToolInfo {
  name: string;
  description: string;
  has_tools: boolean;
}
