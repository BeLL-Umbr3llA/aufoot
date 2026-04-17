// utils/gemini.js

/**
 * Gemini API ကို တိုက်ရိုက်ခေါ်ယူပြီး မြန်မာလို Content ထုတ်ပေးသည့် Function
 */
async function generateContent(data, type) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  // Model နှစ်ခုလုံးကို စမ်းသပ်ရန် စာရင်းသွင်းထားခြင်း
  // 1.5-flash က region ကြောင့် 404 ပြပါက gemini-pro ကို အလိုအလျောက် သုံးပါလိမ့်မည်
  const models = ["gemini-1.5-flash", "gemini-pro"];
  
  let prompt = "";

  // Prompt logic များ
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

  // Model တစ်ခုချင်းစီကို Loop ပတ်ပြီး အလုပ်ဖြစ်သည်အထိ စမ်းမည်
  for (const modelName of models) {
    const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${apiKey}`;
    
    const payload = {
      contents: [{
        parts: [{ text: prompt }]
      }]
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      // အကယ်၍ Response မှာ error မပါဘဲ content ပါလာလျှင်
      if (!result.error && result.candidates && result.candidates[0].content) {
        console.log(`Successfully generated using ${modelName}`);
        return result.candidates[0].content.parts[0].text;
      }
      
      // Error တက်ပါက Log မှတ်ပြီး နောက် Model တစ်ခုသို့ ကူးမည်
      console.warn(`Model ${modelName} failed:`, result.error ? result.error.message : "No content");
      
    } catch (err) {
      console.error(`Fetch error with ${modelName}:`, err.message);
      continue;
    }
  }

  // Model အားလုံး မရတော့ပါက အောက်ပါစာသား ပြန်ပို့မည်
  return "⚠️ AI models များအားလုံး လက်ရှိတွင် အလုပ်မလုပ်သေးပါ။ ခဏနေမှ ထပ်မံကြိုးစားပေးပါ။";
}

module.exports = { generateContent };
