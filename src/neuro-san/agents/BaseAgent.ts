import { GoogleGenAI } from "@google/genai";
import { AgentOutput, AgentContext, AgentMessage } from "../types";

export abstract class BaseAgent {
  protected ai: GoogleGenAI;
  public abstract name: string;
  protected logs: string[] = [];

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    this.ai = new GoogleGenAI({ apiKey });
  }

  protected addLog(message: string) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${this.name}] ${message}`;
    this.logs.push(logEntry);
    console.log(logEntry);
  }

  protected createMessage<T>(payload: T, startTime: number, confidenceScore?: number, reasoningChain?: string[]): AgentMessage<T> {
    return {
      sender: this.name,
      payload,
      meta: {
        timestamp: new Date().toISOString(),
        processingTimeMs: Date.now() - startTime,
        confidenceScore,
        reasoningChain
      }
    };
  }

  protected async callGemini(prompt: string, systemInstruction: string, jsonResponse = true) {
    this.addLog(`Initiating LLM Inference [gemini-3-flash-preview]`);
    
    const maxRetries = 3;
    let lastError: any = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: jsonResponse ? "application/json" : "text/plain",
          },
        });

        const responseText = response.text || "";
        if (jsonResponse) {
          try {
            return JSON.parse(responseText.trim());
          } catch (e) {
            this.addLog(`JSON Parse Error on attempt ${attempt}. Content: ${responseText.substring(0, 50)}...`);
            throw new Error(`Invalid JSON response from model: ${e}`);
          }
        }
        return responseText;
      } catch (error: any) {
        lastError = error;
        const msg = error.message?.toLowerCase() || "";
        const isRetryable = msg.includes("503") || msg.includes("429") || msg.includes("unavailable") || msg.includes("overloaded");
        
        if (isRetryable && attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
          this.addLog(`Retryable failure. Waiting ${Math.round(delay)}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        break;
      }
    }

    this.addLog(`Exhausted retries or encountered terminal error: ${lastError.message}`);
    throw lastError;
  }

  abstract process(input: any, context: AgentContext): Promise<AgentOutput>;
}
