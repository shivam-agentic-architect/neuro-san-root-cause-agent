import { BaseAgent } from "./BaseAgent";
import { AgentOutput, AgentContext } from "../types";

export class PatternDetectionAgent extends BaseAgent {
  public name = "PatternDetectionAgent";

  async process(input: { extracted_errors: string[]; anomalies: string[] }, context: AgentContext): Promise<AgentOutput> {
    this.addLog("Detecting patterns and correlating events...");
    
    const systemInstruction = `
      You are the PatternDetectionAgent in the Neuro-SAN system.
      Your task is to:
      1. Analyze the errors and anomalies provided.
      2. Detect recurring patterns or sudden spikes.
      3. Correlate disparate events that might suggest a shared underlying issue.
      
      Return a JSON object:
      {
        "patterns": string[],
        "correlations": string[],
        "severity": "low" | "medium" | "high" | "critical"
      }
    `;

    const prompt = `
      Extracted Errors:
      ${input.extracted_errors.join("\n")}
      
      Anomalies:
      ${input.anomalies.join("\n")}
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
