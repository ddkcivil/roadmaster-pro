import { GoogleGenAI } from "@google/genai";
import { BOQItem, RFI, ScheduleTask } from '../types';

const getAIClient = () => {
  if (!process.env.API_KEY) {
    console.warn("API_KEY is missing in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const analyzeProjectStatus = async (
  boq: BOQItem[],
  rfis: RFI[],
  schedule: ScheduleTask[],
  userQuery: string
): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return "AI Service Unavailable: Missing API Key.";

  const context = `
    You are an expert Senior Project Manager for a major Road Construction project.
    Analyze the following project data and answer the user's query.
    
    User Query: "${userQuery}"

    Project Data:
    
    1. Critical Schedule Items (Sample):
    ${JSON.stringify(schedule.filter(s => s.status !== 'Completed').slice(0, 5))}

    2. Recent RFIs (Request for Inspection):
    ${JSON.stringify(rfis.slice(0, 5))}

    3. BOQ Financial Progress (Sample):
    ${JSON.stringify(boq.slice(0, 5))}

    Instructions:
    - Be concise and professional.
    - If the schedule shows delays, suggest mitigation strategies (e.g., double shifts, parallel working).
    - If RFIs are rejected, emphasize quality control.
    - Focus on actionable advice for a Project Manager.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: context,
    });
    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "An error occurred while communicating with the AI service.";
  }
};

export const draftLetter = async (topic: string, recipient: string): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return "AI Service Unavailable.";

  const prompt = `
    Draft a formal construction project correspondence letter.
    
    Topic: ${topic}
    Recipient Role: ${recipient}
    Sender Role: Project Manager
    Project: National Highway Road Project Package-4
    
    Style: Formal, Contractual, Professional. 
    Include placeholders for [Date], [Ref No], etc.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Could not generate draft.";
  } catch (error) {
    console.error("Gemini Letter Gen Error:", error);
    return "Error generating letter.";
  }
};