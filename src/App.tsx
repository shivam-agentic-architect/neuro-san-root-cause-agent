/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Terminal, 
  AlertCircle, 
  CheckCircle2, 
  Search, 
  Cpu, 
  Lightbulb, 
  Zap, 
  ChevronRight,
  Database,
  BarChart3,
  Loader2
} from 'lucide-react';
import { NeuroSANOrchestrator } from './neuro-san/workflow/Orchestrator';
import { RootCauseResponse, WorkflowState } from './neuro-san/types';

export default function App() {
  const [logsInput, setLogsInput] = useState("Database timeout error at 10:32 PM. Connection pool exhausted. Multiple retry failures.");
  const [metricsInput, setMetricsInput] = useState('{\n  "db_connections": 100,\n  "max_connections": 100,\n  "cpu_usage": 85\n}');
  const [workflowState, setWorkflowState] = useState<WorkflowState>({
    logs: "",
    status: 'idle'
  });
  const [agentLogs, setAgentLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const orchestrator = useRef(new NeuroSANOrchestrator());

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [agentLogs]);

  const addAgentLog = (msg: string) => {
    setAgentLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleRunAnalysis = async () => {
    setWorkflowState(prev => ({ ...prev, status: 'analyzing', logs: logsInput }));
    setAgentLogs(["[SYSTEM] Workflow initiated..."]);
    
    try {
      let metrics = {};
      try {
        metrics = JSON.parse(metricsInput);
      } catch (e) {
        addAgentLog("[WARNING] Invalid metrics JSON. Proceeding without metrics.");
      }

      await orchestrator.current.runWorkflow(logsInput, metrics, (step, data) => {
        switch (step) {
          case 'analyzing':
            setWorkflowState(prev => ({ ...prev, status: 'analyzing' }));
            addAgentLog("LogAnalyzerAgent: Extracting symptoms...");
            break;
          case 'analyzing_done':
            setWorkflowState(prev => ({ ...prev, extractedErrors: data.extracted_errors, anomalies: data.anomalies }));
            addAgentLog("LogAnalyzerAgent: Extraction complete.");
            break;
          case 'detecting':
            setWorkflowState(prev => ({ ...prev, status: 'detecting' }));
            addAgentLog("PatternDetectionAgent: Correlating events...");
            break;
          case 'detecting_done':
            setWorkflowState(prev => ({ ...prev, patterns: data.patterns }));
            addAgentLog("PatternDetectionAgent: Patterns identified.");
            break;
          case 'diagnosing':
            setWorkflowState(prev => ({ ...prev, status: 'diagnosing' }));
            addAgentLog("RootCauseAgent: Determining root cause...");
            break;
          case 'diagnosing_done':
            setWorkflowState(prev => ({ 
              ...prev, 
              rootCause: data.root_cause, 
              confidence: data.confidence, 
              reasoning: data.reasoning 
            }));
            addAgentLog("RootCauseAgent: Diagnosis complete.");
            break;
          case 'prescribing':
            setWorkflowState(prev => ({ ...prev, status: 'prescribing' }));
            addAgentLog("SolutionAgent: Generating recommendations...");
            break;
          case 'prescribing_done':
            setWorkflowState(prev => ({ 
              ...prev, 
              recommendedFix: data.recommended_fix,
              status: 'completed'
            }));
            addAgentLog("SolutionAgent: Recommendations ready.");
            addAgentLog("[SUCCESS] Workflow completed successfully.");
            break;
        }
      });
    } catch (error) {
      setWorkflowState(prev => ({ ...prev, status: 'failed', error: String(error) }));
      addAgentLog(`[ERROR] Workflow failed: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-200 font-sans p-6">
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-10 flex items-center justify-between border-b border-slate-800/50 pb-6">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
            <Activity className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Neuro-SAN Studio</h1>
            <p className="text-xs text-slate-500 font-mono tracking-widest uppercase mt-0.5">Root Cause Analysis Engine v2.0</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            SYSTEM ACTIVE
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input & Workflow */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-6">
          
          <section className="bg-[#141417] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/30 border-b border-slate-800">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-medium text-slate-300">Observation Input</h2>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">System Logs</label>
                <textarea 
                  value={logsInput}
                  onChange={(e) => setLogsInput(e.target.value)}
                  className="w-full h-32 bg-[#0d0d0f] border border-slate-800 rounded-lg p-3 text-sm font-mono text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                  placeholder="Paste system logs or error messages here..."
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">System Metrics (JSON)</label>
                <textarea 
                  value={metricsInput}
                  onChange={(e) => setMetricsInput(e.target.value)}
                  className="w-full h-24 bg-[#0d0d0f] border border-slate-800 rounded-lg p-3 text-sm font-mono text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                  placeholder='{ "cpu": 80, "memory": 2048 }'
                />
              </div>

              <button 
                onClick={handleRunAnalysis}
                disabled={workflowState.status !== 'idle' && workflowState.status !== 'completed' && workflowState.status !== 'failed'}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-2 group"
              >
                {workflowState.status === 'idle' || workflowState.status === 'completed' || workflowState.status === 'failed' ? (
                  <>
                    <Zap className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Trigger RCA Workflow
                  </>
                ) : (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing Pipeline...
                  </>
                )}
              </button>
            </div>
          </section>

          <section className="bg-[#141417] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/30 border-b border-slate-800">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-medium text-slate-300">Agent Execution Logs</h2>
            </div>
            <div 
              ref={scrollRef}
              className="p-4 h-48 overflow-y-auto font-mono text-[11px] space-y-1 bg-[#0d0d0f]"
            >
              {agentLogs.length === 0 && <p className="text-slate-600 italic">Waiting for execution...</p>}
              {agentLogs.map((log, i) => (
                <div key={i} className={`flex gap-2 ${log.includes('[ERROR]') ? 'text-red-400' : log.includes('[SUCCESS]') ? 'text-emerald-400' : 'text-slate-500'}`}>
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Workflow Visualization & Result */}
        <div className="lg:col-span-12 xl:col-span-7 space-y-6">
          
          {/* Workflow Stepper */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'analyzing', icon: Search, label: 'Analysis' },
              { id: 'detecting', icon: BarChart3, label: 'Patterns' },
              { id: 'diagnosing', icon: AlertCircle, label: 'Diagnosis' },
              { id: 'prescribing', icon: Lightbulb, label: 'Solution' }
            ].map((step, i) => {
              const isActive = workflowState.status === step.id;
              const isDone = ['completed', 'failed'].includes(workflowState.status) || 
                (['detecting', 'diagnosing', 'prescribing'].includes(workflowState.status) && i === 0) ||
                (['diagnosing', 'prescribing'].includes(workflowState.status) && i === 1) ||
                (workflowState.status === 'prescribing' && i === 2);

              return (
                <div key={step.id} className="relative">
                  <div className={`p-4 rounded-xl border transition-all duration-500 flex flex-col items-center gap-2 ${
                    isActive ? 'bg-indigo-500/10 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 
                    isDone ? 'bg-emerald-500/5 border-emerald-500/30' : 
                    'bg-[#141417] border-slate-800 text-slate-600'
                  }`}>
                    <step.icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : isDone ? 'text-emerald-400' : ''}`} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{step.label}</span>
                    {isActive && (
                      <motion.div 
                        layoutId="active-dot"
                        className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.8)]"
                      />
                    )}
                    {isDone && !isActive && (
                      <CheckCircle2 className="absolute top-2 right-2 w-3 h-3 text-emerald-500" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {workflowState.status === 'completed' ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                {/* Result Card */}
                <div className="bg-[#141417] border-2 border-indigo-500/30 rounded-2xl overflow-hidden shadow-2xl">
                  <div className="p-6 border-b border-slate-800 bg-gradient-to-br from-indigo-500/5 to-transparent">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-[0.2em] mb-1">Final Diagnosis</h2>
                        <h3 className="text-2xl font-bold text-white leading-tight">{workflowState.rootCause}</h3>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Confidence Score</div>
                        <div className={`text-2xl font-bold ${
                          (workflowState.confidence || 0) > 0.8 ? 'text-emerald-400' : 'text-amber-400'
                        }`}>
                          {Math.round((workflowState.confidence || 0) * 100)}%
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Reasoning */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 bg-slate-800 rounded-md">
                          <Activity className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Reasoning Chain</h4>
                      </div>
                      <ul className="space-y-3">
                        {workflowState.reasoning?.map((item, i) => (
                          <li key={i} className="flex gap-3 text-sm text-slate-400 bg-slate-800/20 p-3 rounded-lg border border-slate-800/50">
                            <span className="text-indigo-400 font-bold shrink-0">{i + 1}.</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Recommendation */}
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <div className="p-1.5 bg-indigo-500/10 rounded-md">
                            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                          </div>
                          <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-widest">Recommended Fix</h4>
                        </div>
                        <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-100 text-sm leading-relaxed shadow-inner">
                          {workflowState.recommendedFix}
                        </div>
                      </div>

                      {/* Pattern Breakdown */}
                      <div className="bg-[#1a1a1e] p-4 rounded-xl border border-slate-800">
                        <div className="flex items-center gap-2 mb-3">
                          <Database className="w-3.5 h-3.5 text-slate-500" />
                          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Metadata Context</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {workflowState.patterns?.slice(0, 3).map((p, i) => (
                            <span key={i} className="px-2 py-1 bg-slate-800 text-slate-400 rounded text-[10px] border border-slate-700">
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : workflowState.status === 'idle' ? (
              <motion.div 
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-[500px] flex flex-col items-center justify-center text-center space-y-4 bg-[#141417]/50 rounded-2xl border-2 border-dashed border-slate-800"
              >
                <div className="bg-slate-800/50 p-6 rounded-full mb-2">
                  <Cpu className="w-10 h-10 text-slate-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-300">Ready for Analysis</h3>
                  <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2">
                    Enter logs and metrics on the left, then trigger the multi-agent workflow to begin root cause analysis.
                  </p>
                </div>
              </motion.div>
            ) : workflowState.status === 'failed' ? (
              <motion.div 
                key="failed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-8 bg-red-500/10 border border-red-500/20 rounded-2xl flex flex-col items-center gap-4"
              >
                <AlertCircle className="w-12 h-12 text-red-500" />
                <div className="text-center">
                  <h3 className="text-lg font-bold text-red-400">Workflow Error</h3>
                  <p className="text-red-300/60 text-sm font-mono mt-2">{workflowState.error}</p>
                  <button 
                    onClick={() => setWorkflowState({ status: 'idle', logs: "" })}
                    className="mt-6 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors border border-red-500/30"
                  >
                    Reset System
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-[500px] flex flex-col items-center justify-center space-y-8"
              >
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Zap className="w-8 h-8 text-indigo-400 animate-pulse" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold text-white animate-pulse">
                    {workflowState.status === 'analyzing' && "LogAnalyzer is processing..."}
                    {workflowState.status === 'detecting' && "PatternDetection is correlating..."}
                    {workflowState.status === 'diagnosing' && "RootCauseAgent is reasoning..."}
                    {workflowState.status === 'prescribing' && "SolutionAgent is generating..."}
                  </h3>
                  <p className="text-slate-500 text-sm font-mono italic">
                    Communicating with Neuro-SAN Agent Mesh...
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="max-w-6xl mx-auto mt-12 pt-6 border-t border-slate-800 text-[10px] text-slate-600 uppercase tracking-[0.3em] flex justify-between items-center">
        <div>Neuro-SAN Framework • Production Environment</div>
        <div className="flex gap-6">
          <span>Agent Mesh: Secure</span>
          <span>Latency: 240ms</span>
          <span>Model: Gemini 3.1 Pro</span>
        </div>
      </footer>
    </div>
  );
}
