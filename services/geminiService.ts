import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Enhances an architectural image using Gemini 3 Pro Image Preview.
 * Specifically targets the requirement to simulate a line-drawing conversion process
 * to enhance lighting, shadows, and textures while maintaining original colors.
 */
export const enhanceArchitecturalImage = async (
  base64Data: string,
  mimeType: string,
  userInstruction?: string,
  timeOfDay: 'day' | 'night' = 'day',
  addBackground: boolean = false
): Promise<string> => {
  
  try {
    // Specific prompt engineering based on user requirements
    const baseInstruction = `
      You are an expert architectural visualizer. 
      Task: Beautify this building exterior perspective ("パース").
      
      Strict Process:
      1. Internally, analyze the image structure as if converting it to a precise line drawing.
      2. Re-render the image using the original color palette.
      3. Significantly enhance the lighting (add realistic global illumination and ambient occlusion).
      4. Deepen the shadows for better depth perception.
      5. Enhance the surface textures (concrete, glass, wood, metal) to be photorealistic.
      6. Ensure the output is a high-quality image.
    `;

    let timeInstruction = "";
    if (timeOfDay === 'day') {
      timeInstruction = "Lighting Setting: Daytime. Bright natural sunlight, clear blue sky, distinct shadows, vibrant and energetic atmosphere.";
    } else {
      timeInstruction = "Lighting Setting: Nighttime. Dark evening sky, warm artificial lighting emitting from windows and exterior fixtures, dramatic contrast, cozy and elegant atmosphere.";
    }

    let backgroundInstruction = "";
    if (addBackground) {
      backgroundInstruction = "Background Generation: The user has requested to fill the background. If the input image has a white or empty background, generate a realistic, context-aware environment (sky, landscape, greenery, or city street) that seamlessly blends with the building's perspective and the selected time of day. Do not leave white space.";
    }

    const finalPrompt = `
      ${baseInstruction}
      
      ${timeInstruction}

      ${backgroundInstruction}
      
      ${userInstruction ? `Additional User Requirement: ${userInstruction}` : ''}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: finalPrompt,
          },
        ],
      },
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    // Iterate through parts to find the image
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64Response = part.inlineData.data;
          // Defaulting to jpeg as requested by the user ("出力はJPG")
          return `data:image/jpeg;base64,${base64Response}`;
        }
      }
    }

    throw new Error("No image data found in the response.");

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to enhance image.");
  }
};