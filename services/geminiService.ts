import { GoogleGenAI } from "@google/genai";
import { GeneratorSettings } from "../types";

/**
 * Generates an SRT subtitle string from a video file.
 * Uses gemini-3-pro-preview (or user specified model) for multimodal video understanding.
 */
export const generateSubtitlesFromVideo = async (
  base64Data: string, 
  mimeType: string,
  settings: GeneratorSettings
): Promise<string> => {
  
  try {
    // Initialize the client with optional custom endpoint for self-hosted LLMs
    const ai = new GoogleGenAI({ 
      apiKey: process.env.API_KEY,
      baseUrl: settings.customEndpoint || undefined // Defaults to Google's API if empty
    });

    const modelId = settings.modelId || 'gemini-3-pro-preview';

    // Construct prompting logic based on settings
    const speakerInstruction = settings.enableSpeakerLabels
      ? "2. Identify distinct speakers. Start each subtitle line with the speaker's name or label (e.g., 'Speaker 1:', 'Interviewer:', 'Mary:') followed by a colon."
      : "2. Do not include speaker names unless strictly essential for clarity.";

    const contextInstruction = settings.contentContext
      ? `CRITICAL CONTEXT: The video content belongs to the following domain: "${settings.contentContext}". Ensure all terminology, slang, and context-specific language is transcribed accurately according to this domain.`
      : "";

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: `You are an expert professional video subtitler. 
            
            ${contextInstruction}

            Your task is to analyze the provided video and generate a precise SubRip Subtitle (SRT) file.
            
            1. Transcribe all spoken dialogue accurately.
            ${speakerInstruction}
            3. CRITICAL: Because you have video understanding capabilities, include significant visual context or non-speech audio cues in brackets, for example: [Door slams], [Upbeat music plays], [Character smiles nervously], [Explosion].
            4. Ensure the timestamps are strictly in the SRT format (00:00:00,000 --> 00:00:00,000).
            5. Return ONLY the raw SRT content. Do not wrap it in markdown code blocks like \`\`\`srt ... \`\`\`. Do not add any introductory text. Just the file content.`
          },
        ],
      },
      config: {
        maxOutputTokens: 8192, 
        temperature: 0.2,
      }
    });

    const srtContent = response.text || "";
    const cleanSrt = srtContent.replace(/^```srt\n/, '').replace(/^```\n/, '').replace(/\n```$/, '');

    return cleanSrt;

  } catch (error) {
    console.error("Error generating subtitles:", error);
    throw error;
  }
};