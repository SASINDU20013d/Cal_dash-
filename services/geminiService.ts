import { GoogleGenAI, Type } from "@google/genai";
import { FundDataPoint, AiAnalysisResult } from "../types";

// Helper to sample data to reduce token count
const sampleData = (data: FundDataPoint[], sampleSize: number = 50): FundDataPoint[] => {
  if (data.length <= sampleSize) return data;
  const step = Math.floor(data.length / sampleSize);
  return data.filter((_, index) => index % step === 0).slice(-sampleSize);
};

export const analyzeFundPerformance = async (
  fundName: string,
  data: FundDataPoint[]
): Promise<AiAnalysisResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please set REACT_APP_GEMINI_API_KEY.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const recentData = sampleData(data, 60); // Last ~60 points (approx 2 months if daily)
  
  const prompt = `
    Analyze the following historical pricing data for the unit trust fund named "${fundName}".
    The data provided is a sampled time series of dates and NAV (prices).
    
    Data: ${JSON.stringify(recentData)}

    Please provide:
    1. A concise summary of the recent trend (last 2 months).
    2. The overall sentiment (bullish, bearish, or neutral).
    3. Three key observations or potential risks/opportunities for an investor.
    
    Return the response as a JSON object.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            sentiment: { type: Type.STRING, enum: ['bullish', 'bearish', 'neutral'] },
            keyPoints: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            }
          },
          required: ['summary', 'sentiment', 'keyPoints']
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AiAnalysisResult;
    }
    throw new Error("No response from AI");
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return {
      summary: "AI Analysis currently unavailable. Please check API configuration or try again later.",
      sentiment: "neutral",
      keyPoints: ["Unable to fetch insights."]
    };
  }
};
