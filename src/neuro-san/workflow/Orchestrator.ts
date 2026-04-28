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
    const workflowId = Math.random().toString(36).substring(7);
    const history: AgentOutput[] = [];
    const context: AgentContext = { workflowId, history };

    // Step 1: Log Analysis
    onProgress?.('analyzing', null);
    const analyzerOutput = await this.logAnalyzer.process({ logs, metrics }, context);
    history.push(analyzerOutput);
    onProgress?.('analyzing_done', analyzerOutput.data);

    // Step 2: Pattern Detection
    onProgress?.('detecting', null);
    const patternOutput = await this.patternDetector.process(analyzerOutput.data, context);
    history.push(patternOutput);
    onProgress?.('detecting_done', patternOutput.data);

    // Step 3: Root Cause Analysis
    onProgress?.('diagnosing', null);
    const rootCauseOutput = await this.rootCauseAgent.process({ 
      ...patternOutput.data, 
      logs 
    }, context);
    history.push(rootCauseOutput);
    onProgress?.('diagnosing_done', rootCauseOutput.data);

    // Step 4: Solution Generation
    onProgress?.('prescribing', null);
    const solutionOutput = await this.solutionAgent.process(rootCauseOutput.data, context);
    history.push(solutionOutput);
    onProgress?.('prescribing_done', solutionOutput.data);

    // Final Aggregate Result
    const finalResult: RootCauseResponse = {
      root_cause: rootCauseOutput.data.root_cause,
      confidence: rootCauseOutput.data.confidence,
      reasoning: rootCauseOutput.data.reasoning,
      recommended_fix: solutionOutput.data.recommended_fix
    };

    onProgress?.('completed', finalResult);
    return finalResult;
  }
}
