import { BaseAgent } from "./BaseAgent";
import { AgentOutput, AgentContext } from "../types";

export class LogAnalyzerAgent extends BaseAgent {
  public name = "LogAnalyzerAgent";

  async process(input: { logs: string; metrics?: any }, context: AgentContext): Promise<AgentOutput> {
    this.addLog("Starting log analysis and normalization...");
    
    const systemInstruction = `
      You are the LogAnalyzerAgent in the Neuro-SAN Root Cause Analysis system.
      Your task is to:
      1. Extract key errors and exceptions from the provided logs.
      2. Identify anomalies in timing or frequency.
      3. Normalize the data into a clean structure for downstream agents.
      
      Return a JSON object:
      {
        "extracted_errors": string[],
        "anomalies": string[],
        "summary": string
      }
    `;

    const prompt = `
      Logs:
      ${input.logs}
      
      Metrics:
      ${JSON.stringify(input.metrics || {})}
    `;

    const data = await this.callGemini(prompt, systemInstruction);
    
    return {
      agentName: this.name,
      data,
      timestamp: new Date().toISOString(),
      logs: [...this.logs]
    };
  }
}
