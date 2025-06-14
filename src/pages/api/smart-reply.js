import { GoogleGenerativeAI } from "@google/generative-ai";

const gemini = new GoogleGenerativeAI(import.meta.env.PUBLIC_GEMINI_API_KEY);
const model = gemini.getGenerativeModel({ model: "models/gemini-1.5-pro" });

export async function POST(req, res) {
  try {
    const { message } = await req.request.json();
    const prompt = `Based on this message: '${message}', suggest 3 short reply options.`;
    const result = await model.generateContent({
      contents: [{ parts: [{ text: prompt }] }],
    });

    const responseText =
      result.response?.candidates?.[0]?.content?.parts?.[0]?.text;

    res.status(200).json({ suggestions: responseText ? [responseText] : [] });
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    res.status(500).json({ error: "Failed to get suggestion from Gemini." });
  }
}