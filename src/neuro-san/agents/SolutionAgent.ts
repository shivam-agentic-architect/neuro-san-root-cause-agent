import { BaseAgent } from "./BaseAgent";
import { AgentOutput, AgentContext } from "../types";

export class SolutionAgent extends BaseAgent {
  public name = "SolutionAgent";

  async process(input: { root_cause: string; reasoning: string[] }, context: AgentContext): Promise<AgentOutput> {
    this.addLog("Generating recommended fixes and preventive steps...");
    
    const systemInstruction = `
      You are the SolutionAgent in the Neuro-SAN system.
      Your task is to:
      1. Review the diagnosed root cause.
      2. Recommend an actionable fix.
      3. Suggest preventive steps to avoid recurrence.
      
      Return a JSON object:
      {
        "recommended_fix": string,
        "preventive_actions": string[]
      }
    `;

    const prompt = `
      Root Cause:
      ${input.root_cause}
      
      Reasoning:
      ${input.reasoning.join("\n")}
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
