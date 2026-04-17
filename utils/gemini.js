const { GoogleGenerativeAI } = require("@google/generative-ai");

// Gemini API Key ကို .env ထဲကနေ ယူမယ်
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateContent(data, type) {
  try {
    // Model နာမည်ကို models/ မပါဘဲ အခုလို ရေးပါ
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let prompt = "";
    if (type === 'news') {
      prompt = `You are a professional football news editor. Based on this info: ${data.title} - ${data.description}, 
                write a catchy football news post in Burmese (Unicode). Use an engaging tone for Myanmar football fans.`;
    } else if (type === 'preview') {
      prompt = `Provide a pre-match preview in Burmese for: ${JSON.stringify(data)}. Include match time and prediction.`;
    } else if (type === 'analysis') {
      prompt = `Write a post-match analysis in Burmese based on these stats: ${JSON.stringify(data)}. Highlight key performers.`;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Error:", error.message);
    return "သုံးသပ်ချက် ရေးသားရာတွင် အမှားအယွင်း ရှိနေပါသည်။";
  }
}

module.exports = { generateContent };
