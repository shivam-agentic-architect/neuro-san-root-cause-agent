import { BaseAgent } from "./BaseAgent";
import { AgentOutput, AgentContext } from "../types";

export class RootCauseAgent extends BaseAgent {
  public name = "RootCauseAgent";

  async process(input: { patterns: string[]; correlations: string[]; logs: string }, context: AgentContext): Promise<AgentOutput> {
    this.addLog("Synthesizing final diagnosis...");
    
    const systemInstruction = `
      You are the RootCauseAgent. Synthesize root cause and reasoning.
      Format: JSON { "root_cause": string, "confidence": number, "reasoning": string[] }
    `;

    const prompt = `Patterns: ${input.patterns.join(", ")}\nCorrelations: ${input.correlations.join(", ")}\nContext: ${input.logs}`;
    const data = await this.callGemini(prompt, systemInstruction);
    
    return {
      agentName: this.name,
      data,
      timestamp: new Date().toISOString(),
      logs: [...this.logs]
    };
  }
}
