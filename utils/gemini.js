// utils/gemini.js

async function generateContent(data, type) {
  const apiKey = process.env.GEMINI_API_KEY;
  const models = ["gemini-1.5-flash", "gemini-1.5-pro"];
  
  let prompt = "";
  if (type === 'news') {
    prompt = `Professional Football Journalist: Please summarize this football news in Burmese (Unicode). 
              Make it engaging for Myanmar football fans. 
              News Title: ${data.title}
              Description: ${data.description}`;
  } else if (type === 'preview') {
    prompt = `Write a pre-match preview in Burmese for: ${data.teams.home.name} vs ${data.teams.away.name}. 
              Include current form and a prediction.`;
  } else if (type === 'analysis') {
    prompt = `Write a post-match analysis in Burmese for: ${data.teams.home.name} vs ${data.teams.away.name}. 
              Match goals: ${JSON.stringify(data.goals)}. Highlight key moments.`;
  }

  for (const modelName of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    
    const payload = {
      contents: [{ parts: [{ text: prompt }] }]
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!result.error && result.candidates && result.candidates[0].content) {
        console.log(`Successfully generated using ${modelName}`);
        return result.candidates[0].content.parts[0].text;
      }
      
      console.warn(`Model ${modelName} failed:`, result.error ? result.error.message : "No content");
    } catch (err) {
      console.error(`Fetch error with ${modelName}:`, err.message);
      continue;
    }
  }

  return "⚠️ AI models များအားလုံး လက်ရှိတွင် အလုပ်မလုပ်သေးပါ။ ခဏနေမှ ထပ်မံကြိုးစားပေးပါ။";
}

module.exports = { generateContent };
