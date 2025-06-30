import { OptimizeRequest, OptimizationResponse, ToolInfo } from "../types/api";

const API_BASE_URL = "http://localhost:8000";

export const apiService = {
  async getTools(): Promise<ToolInfo[]> {
    const response = await fetch(`${API_BASE_URL}/tools`);
    if (!response.ok) {
      throw new Error("Failed to fetch tools");
    }
    return response.json();
  },

  async optimizePrompt(
    request: OptimizeRequest
  ): Promise<OptimizationResponse> {
    const response = await fetch(`${API_BASE_URL}/optimize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to optimize prompt");
    }

    return response.json();
  },
};
