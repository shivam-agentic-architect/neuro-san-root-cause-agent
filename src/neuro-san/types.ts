export interface AgentOutput<T = any> {
  agentName: string;
  data: T;
  timestamp: string;
  logs: string[];
}

export interface RootCauseResponse {
  root_cause: string;
  confidence: number;
  reasoning: string[];
  recommended_fix: string;
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
  status: 'idle' | 'analyzing' | 'detecting' | 'diagnosing' | 'prescribing' | 'completed' | 'failed';
  error?: string;
}

export interface AgentContext {
  workflowId: string;
  history: AgentOutput[];
}
