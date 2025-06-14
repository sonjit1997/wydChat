import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: "sk-6f7f15c8e3d3476fada210b842857e35",
});

export async function POST(req, res) {
  try {

    const { message } = await req.request.json();

    const prompt = `Based on this message: '${message}', suggest 3 short reply options.`;

    const result = await openai.chat.completions.create({
      messages: [{ role: "system", content: prompt }],
      model: "deepseek-chat",
    });

    const responseText =
      result.response?.candidates?.[0]?.content?.parts?.[0]?.text;

    res.status(200).json({ suggestions: responseText ? [responseText] : [] });
  } catch (error) {
    console.error("Error calling Deepseek API:", error);
    res.status(500).json({ error: "Failed to get suggestion from Deepseek." });
  }
}
