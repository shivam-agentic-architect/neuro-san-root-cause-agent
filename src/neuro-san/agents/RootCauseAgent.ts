import { BaseAgent } from "./BaseAgent";
import { AgentOutput, AgentContext } from "../types";

export class RootCauseAgent extends BaseAgent {
  public name = "RootCauseAgent";

  async process(input: { patterns: string[]; correlations: string[]; logs: string }, context: AgentContext): Promise<AgentOutput> {
    this.addLog("Diagnosing root cause...");
    
    const systemInstruction = `
      You are the RootCauseAgent in the Neuro-SAN system.
      Your task is to:
      1. Review the detected patterns and correlations.
      2. Predict the most probable root cause of the system failure.
      3. Provide a clear reasoning chain (step-by-step logic).
      
      Return a JSON object:
      {
        "root_cause": string,
        "confidence": number (0 to 1),
        "reasoning": string[]
      }
    `;

    const prompt = `
      Original Logs:
      ${input.logs}

      Patterns Found:
      ${input.patterns.join("\n")}
      
      Correlations Found:
      ${input.correlations.join("\n")}
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
