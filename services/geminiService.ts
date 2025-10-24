import { GoogleGenAI, Type } from "@google/genai";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getHadithExplanation(hadithText: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Anda adalah seorang ahli hadits yang ramah dan mudah dipahami. Jelaskan (syarah) hadits berikut ini secara mendalam namun dengan bahasa yang cocok untuk pemula. Berikan konteks, pelajaran yang bisa diambil, dan relevansinya dengan kehidupan modern.\n\nHadits:\n${hadithText}`,
      // Fix: Inlined model configuration as per the new SDK guidelines. The `generationConfig` constant is deprecated.
      config: {
        temperature: 0.5,
        topK: 64,
        topP: 0.95,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error getting Hadith explanation:", error);
    throw new Error("Failed to generate explanation from Gemini API.");
  }
}

export async function findRelatedHadith(hadithText: string): Promise<Array<{ bookName: string; hadithNumber: number }>> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Anda adalah seorang peneliti hadits. Berdasarkan hadits ini, temukan 2-3 hadits lain dari kitab yang berbeda (jika memungkinkan) yang memiliki tema atau pesan serupa. Berikan respons HANYA dalam format JSON yang cocok dengan skema yang diberikan.\n\nHadits acuan:\n${hadithText}`,
      // Fix: Inlined model configuration as per the new SDK guidelines. The `generationConfig` constant is deprecated.
      config: {
        temperature: 0.5,
        topK: 64,
        topP: 0.95,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            related_hadiths: {
              type: Type.ARRAY,
              description: "Daftar hadits terkait.",
              items: {
                type: Type.OBJECT,
                properties: {
                  bookName: {
                    type: Type.STRING,
                    description: "Nama kitab hadits, contoh: 'HR. Bukhari', 'HR. Tirmidzi'."
                  },
                  hadithNumber: {
                    type: Type.INTEGER,
                    description: "Nomor hadits dalam kitab tersebut."
                  }
                },
                required: ["bookName", "hadithNumber"]
              }
            }
          },
          required: ["related_hadiths"]
        },
      },
    });

    const jsonResponse = JSON.parse(response.text.trim());
    return jsonResponse.related_hadiths || [];
  } catch (error) {
    console.error("Error finding related Hadith:", error);
    // Returning an empty array to prevent UI breakage
    return [];
  }
}
