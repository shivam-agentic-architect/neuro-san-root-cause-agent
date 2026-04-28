import { LogAnalyzerAgent } from "../agents/LogAnalyzerAgent";
import { PatternDetectionAgent } from "../agents/PatternDetectionAgent";
import { RootCauseAgent } from "../agents/RootCauseAgent";
import { SolutionAgent } from "../agents/SolutionAgent";
import { AgentOutput, AgentContext, RootCauseResponse } from "../types";

export class NeuroSANOrchestrator {
  private logAnalyzer: LogAnalyzerAgent;
  private patternDetector: PatternDetectionAgent;
  private rootCauseAgent: RootCauseAgent;
  private solutionAgent: SolutionAgent;

  constructor() {
    this.logAnalyzer = new LogAnalyzerAgent();
    this.patternDetector = new PatternDetectionAgent();
    this.rootCauseAgent = new RootCauseAgent();
    this.solutionAgent = new SolutionAgent();
  }

  async runWorkflow(logs: string, metrics?: any, onProgress?: (step: string, data: any) => void): Promise<RootCauseResponse> {
    const workflowId = "WS-" + Math.random().toString(36).substring(7);
    const history: AgentOutput[] = [];
    const context: AgentContext = { workflowId, history };

    try {
      // Step 1: Log Analysis
      onProgress?.('analyzing', null);
      const analyzerOutput = await this.logAnalyzer.process({ logs, metrics }, context);
      history.push(analyzerOutput);

      // Step 2: Pattern Detection
      onProgress?.('detecting', analyzerOutput.data);
      const patternOutput = await this.patternDetector.process(analyzerOutput.data, context);
      history.push(patternOutput);

      // Step 3: Root Cause Analysis
      onProgress?.('diagnosing', patternOutput.data);
      const rootCauseOutput = await this.rootCauseAgent.process({ 
        ...patternOutput.data, 
        logs 
      }, context);
      history.push(rootCauseOutput);

      // Step 4: Solution Generation
      onProgress?.('prescribing', rootCauseOutput.data);
      const solutionOutput = await this.solutionAgent.process(rootCauseOutput.data, context);
      history.push(solutionOutput);

      return {
        root_cause: rootCauseOutput.data.root_cause,
        confidence: rootCauseOutput.data.confidence,
        reasoning: rootCauseOutput.data.reasoning,
        recommended_fix: solutionOutput.data.recommended_fix
      };
    } catch (error) {
      console.error("[ORCHESTRATOR WORKFLOW ERROR]", error);
      throw error;
    }
  }
}
