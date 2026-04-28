import { GoogleGenAI } from "@google/genai";
import { AgentOutput, AgentContext } from "../types";

export abstract class BaseAgent {
  protected ai: GoogleGenAI;
  public abstract name: string;
  protected logs: string[] = [];

  constructor() {
    // In AI Studio Build, GEMINI_API_KEY is available as process.env.GEMINI_API_KEY
    const apiKey = process.env.GEMINI_API_KEY;
    this.ai = new GoogleGenAI({ apiKey });
  }

  protected addLog(message: string) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${this.name}] ${message}`;
    this.logs.push(logEntry);
    console.log(logEntry);
  }

  protected async callGemini(prompt: string, systemInstruction: string, jsonResponse = true) {
    this.addLog(`Calling Gemini (Model: gemini-3-flash-preview)`);
    
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
        return JSON.parse(responseText.trim());
      }
      return responseText;
    } catch (error: any) {
      this.addLog(`Critical API Error: ${error.message || error}`);
      throw error;
    }
  }

  abstract process(input: any, context: AgentContext): Promise<AgentOutput>;
}
