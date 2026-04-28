import { GoogleGenAI } from "@google/genai";
import { AgentOutput, AgentContext } from "../types";

export abstract class BaseAgent {
  protected ai: GoogleGenAI;
  public abstract name: string;
  protected logs: string[] = [];

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
  }

  protected addLog(message: string) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${this.name}] ${message}`;
    this.logs.push(logEntry);
    console.log(logEntry);
  }

  protected async callGemini(prompt: string, systemInstruction: string, jsonResponse = true) {
    this.addLog(`Calling Gemini with prompt: ${prompt.substring(0, 100)}...`);
    
    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: jsonResponse ? "application/json" : "text/plain",
        },
      });

      const text = response.text || "";
      if (jsonResponse) {
        try {
          return JSON.parse(text);
        } catch (e) {
          this.addLog(`Failed to parse JSON response: ${text}`);
          throw new Error("Invalid output format from agent");
        }
      }
      return text;
    } catch (error) {
      this.addLog(`Error calling Gemini: ${error}`);
      throw error;
    }
  }

  abstract process(input: any, context: AgentContext): Promise<AgentOutput>;
}
