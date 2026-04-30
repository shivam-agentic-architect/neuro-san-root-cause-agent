export type Severity = 'Low' | 'Medium' | 'High' | 'Critical';

export interface AgentMessage<T = any> {
  sender: string;
  payload: T;
  meta: {
    timestamp: string;
    processingTimeMs: number;
    confidenceScore?: number;
    reasoningChain?: string[];
  };
}

export interface AgentOutput<T = any> {
  agentName: string;
  data: T;
  timestamp: string;
  logs: string[];
  message?: AgentMessage<T>;
}

export interface RootCauseResponse {
  root_cause: string;
  confidence: number;
  reasoning: string[];
  recommended_fix: string;
  preventive_actions: string[];
  severity: Severity;
}

export interface WorkflowState {
  logs: string;
  metrics?: Record<string, any>;
  extractedErrors?: string[];
  anomalies?: string[];
  patterns?: string[];
  rootCause?: string;
  confidence?: number;
  reasoning?: string[];
  recommendedFix?: string;
  preventiveActions?: string[];
  severity?: Severity;
  status: 'idle' | 'analyzing' | 'detecting' | 'diagnosing' | 'prescribing' | 'completed' | 'failed';
  error?: string;
}

export interface AgentContext {
  workflowId: string;
  history: AgentOutput[];
}
