

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateContent(data, type) {
  try {
    // Model name ကို gemini-1.5-flash-latest လို့ ပြောင်းသုံးပါ
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

     let prompt = "";
    if (type === 'news') {
      prompt = `Football journalist style. Summarize this news in Burmese (Unicode): Title: ${data.title}, Description: ${data.description}. Make it engaging for Myanmar fans.`;
    } else if (type === 'preview') {
      prompt = `Pre-match preview in Burmese for: ${data.teams.home.name} vs ${data.teams.away.name}. Prediction included.`;
    } else if (type === 'analysis') {
      prompt = `Post-match analysis in Burmese for: ${data.teams.home.name} vs ${data.teams.away.name}. Stats: ${JSON.stringify(data.score)}.`;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Error Detail:", error);
    // အကယ်၍ flash-latest နဲ့မှ မရရင် gemini-pro ကို fallback အနေနဲ့ သုံးမယ်
    try {
        const fallbackModel = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await fallbackModel.generateContent("Summarize: " + data.title);
        const response = await result.response;
        return response.text();
    } catch (fallbackError) {
        return `⚠️ Gemini Error: ${error.message}`;
    }
  }
}

module.exports = { generateContent };
