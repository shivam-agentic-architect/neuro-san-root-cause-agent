import { BaseAgent } from "./BaseAgent";
import { AgentOutput, AgentContext } from "../types";

export class LogAnalyzerAgent extends BaseAgent {
  public name = "LogAnalyzerAgent";

  async process(input: { logs: string; metrics?: any }, context: AgentContext): Promise<AgentOutput> {
    const startTime = Date.now();
    this.addLog("Executing Log Ingestion & Structural Analysis...");

    if (!input.logs || input.logs.trim().length === 0) {
      this.addLog("Empty logs received. Short-circuiting...");
      return {
        agentName: this.name,
        data: { extracted_errors: [], anomalies: [], summary: "No data to analyze." },
        timestamp: new Date().toISOString(),
        logs: [...this.logs]
      };
    }
    
    const systemInstruction = `
      You are an expert Logs Analysis Agent (Neuro-SAN L1).
      Your task: Analyze logs and metrics to identify technical debt, bottlenecks, and failure points.

      CRITICAL: You must provide a "reasoning_chain" explaining your extraction logic.
      
      OUTPUT FORMAT:
      {
        "extracted_errors": ["Error 1", "Error 2"],
        "anomalies": ["Metric anomaly A"],
        "summary": "Concise technical summary",
        "reasoning_chain": ["Step 1 observation", "Step 2 deduction"],
        "confidence": 0.0-1.0
      }
    `;

    const prompt = `LOG DATA SOURCE:\n${input.logs}\n\nMETRICS CONTEXT:\n${JSON.stringify(input.metrics || {})}`;
    const response = await this.callGemini(prompt, systemInstruction);
    
    const message = this.createMessage(
      response, 
      startTime, 
      response.confidence, 
      response.reasoning_chain
    );

    return {
      agentName: this.name,
      data: response,
      timestamp: new Date().toISOString(),
      logs: [...this.logs],
      message
    };
  }
}
