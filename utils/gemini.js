
async function generateContent(data, type) {
  const apiKey = process.env.GEMINI_API_KEY;
  // v1 API endpoint ကို တိုက်ရိုက်သုံးပါမယ်
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

 
     let prompt = "";
    if (type === 'news') {
      prompt = `Football journalist style. Summarize this news in Burmese (Unicode): Title: ${data.title}, Description: ${data.description}. Make it engaging for Myanmar fans.`;
    } else if (type === 'preview') {
      prompt = `Pre-match preview in Burmese for: ${data.teams.home.name} vs ${data.teams.away.name}. Prediction included.`;
    } else if (type === 'analysis') {
      prompt = `Post-match analysis in Burmese for: ${data.teams.home.name} vs ${data.teams.away.name}. Stats: ${JSON.stringify(data.score)}.`;
    }

  const payload = {
    contents: [{
      parts: [{ text: prompt }]
    }]
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (result.error) {
      console.error("Gemini API Error:", result.error.message);
      return `⚠️ Error: ${result.error.message}`;
    }

    // Response ထဲက စာသားကို ဆွဲထုတ်ခြင်း
    return result.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Fetch Error:", error);
    return "⚠️ AI နဲ့ ချိတ်ဆက်ရာတွင် အခက်အခဲရှိနေပါသည်။";
  }
}

module.exports = { generateContent };


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
