import { BaseAgent } from "./BaseAgent";
import { AgentOutput, AgentContext } from "../types";

export class PatternDetectionAgent extends BaseAgent {
  public name = "PatternDetectionAgent";

  async process(input: { extracted_errors: string[]; anomalies: string[] }, context: AgentContext): Promise<AgentOutput> {
    this.addLog("Correlating symptoms into patterns...");
    
    const systemInstruction = `
      You are the PatternDetectionAgent. Group errors into patterns and correlate them with anomalies.
      Format: JSON { "patterns": string[], "correlations": string[], "severity": string }
    `;

    const prompt = `Errors: ${JSON.stringify(input.extracted_errors)}\nAnomalies: ${JSON.stringify(input.anomalies)}`;
    const data = await this.callGemini(prompt, systemInstruction);
    
    return {
      agentName: this.name,
      data,
      timestamp: new Date().toISOString(),
      logs: [...this.logs]
    };
  }
}
