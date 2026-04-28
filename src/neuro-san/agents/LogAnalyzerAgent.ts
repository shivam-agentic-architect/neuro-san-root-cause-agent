import { BaseAgent } from "./BaseAgent";
import { AgentOutput, AgentContext } from "../types";

export class LogAnalyzerAgent extends BaseAgent {
  public name = "LogAnalyzerAgent";

  async process(input: { logs: string; metrics?: any }, context: AgentContext): Promise<AgentOutput> {
    this.addLog("Processing log ingestion...");
    
    const systemInstruction = `
      You are the LogAnalyzerAgent. Extract key errors, anomalous metrics, and symptoms.
      Format: JSON { "extracted_errors": string[], "anomalies": string[], "summary": string }
    `;

    const prompt = `Logs: ${input.logs}\nMetrics: ${JSON.stringify(input.metrics || {})}`;
    const data = await this.callGemini(prompt, systemInstruction);
    
    return {
      agentName: this.name,
      data,
      timestamp: new Date().toISOString(),
      logs: [...this.logs]
    };
  }
}
