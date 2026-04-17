const { GoogleGenerativeAI } = require("@google/generative-ai");

// API Version ပြဿနာမတက်အောင် SDK ကို နောက်ဆုံး version သုံးပေးပါ
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateContent(data, type) {
  // model name ကို သေချာစစ်ပါ
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  
  let prompt = "";
  if (type === 'news') {
    prompt = `You are a professional football journalist in Myanmar. Translate and summarize this news: "${data.description || data.title}". 
              Create a catchy Unicode Burmese headline. Tone: Exciting and informative. Use football slang used in Myanmar.`;
  } else if (type === 'preview') {
    prompt = `Write a pre-match preview in Burmese for this match: ${data.teams.home.name} vs ${data.teams.away.name}. 
              Base it on these stats: ${JSON.stringify(data)}. Include predicted winner.`;
  } else if (type === 'analysis') {
    prompt = `Write a professional post-match analysis in Burmese for: ${data.teams.home.name} ${data.goals.home}-${data.goals.away} ${data.teams.away.name}. 
              Highlight key moments and player performances.`;
  }

  const result = await model.generateContent(prompt);
  return result.response.text();
}

module.exports = { generateContent };
