import { BaseAgent } from "./BaseAgent";
import { AgentOutput, AgentContext } from "../types";

export class SolutionAgent extends BaseAgent {
  public name = "SolutionAgent";

  async process(input: { root_cause: string; reasoning: string[] }, context: AgentContext): Promise<AgentOutput> {
    this.addLog("Generating remediation plan...");
    
    const systemInstruction = `
      You are the SolutionAgent. Recommend a fix and preventive steps.
      Format: JSON { "recommended_fix": string, "preventive_actions": string[] }
    `;

    const prompt = `Root Cause: ${input.root_cause}\nReasoning: ${input.reasoning.join("\n")}`;
    const data = await this.callGemini(prompt, systemInstruction);
    
    return {
      agentName: this.name,
      data,
      timestamp: new Date().toISOString(),
      logs: [...this.logs]
    };
  }
}
