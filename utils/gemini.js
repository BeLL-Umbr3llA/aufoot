const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateContent(data, type) {
  try {
    // Model နာမည်မှာ models/ မပါရပါ
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let prompt = "";
    if (type === 'news') {
      prompt = `Football journalist style. Summarize this news in Burmese (Unicode): Title: ${data.title}, Description: ${data.description}. Make it engaging for Myanmar fans.`;
    } else if (type === 'preview') {
      prompt = `Pre-match preview in Burmese for: ${data.teams.home.name} vs ${data.teams.away.name}. Prediction included.`;
    } else if (type === 'analysis') {
      prompt = `Post-match analysis in Burmese for: ${data.teams.home.name} vs ${data.teams.away.name}. Stats: ${JSON.stringify(data.score)}.`;
    }

// 2. Content ထုတ်လုပ်ခြင်း
    const result = await model.generateContent(prompt);
    
    // 3. Response ကို စောင့်ပြီးမှ Text ပြောင်းခြင်း (အရေးကြီးသည်)
    const response = await result.response;
    const text = response.text();
    
    return text;
  } catch (error) {
    // Error အစစ်အမှန်ကို Console မှာ ကြည့်နိုင်အောင် ထည့်ထားပါ
    console.error("Gemini Error Detail:", error);
    return `သုံးသပ်ချက် ရေးသားရာတွင် အမှားအယွင်း ရှိနေပါသည်။ (Error: ${error.message})`;
  }
}

module.exports = { generateContent };
