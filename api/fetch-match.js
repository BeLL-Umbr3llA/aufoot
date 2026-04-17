const { Bot } = require('grammy');
const dbConnect = require('../utils/db');
const Post = require('../models/Post');
const { generateContent } = require('../utils/gemini');

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);

export default async function handler(req, res) {
  await dbConnect();
  
  // API-Football key က .env ထဲက FOOTBALL_API_KEY ဖြစ်ရပါမယ်
  const apiKey = process.env.FOOTBALL_API_KEY; 

  try {
    // Premier League (League ID: 39) ရဲ့ ဒီနေ့ပွဲစဉ်တွေကို ယူမယ်
    const response = await fetch('https://v3.football.api-sports.io/fixtures?league=39&season=2025&next=5', {
      headers: { 
        'x-apisports-key': apiKey,
        'x-apisports-host': 'v3.football.api-sports.io'
      }
    });
    
    const { response: matches } = await response.json();

    for (const match of matches) {
      // ပွဲပြီး/မပြီး စစ်မယ် (FT = Full Time)
      const isFinished = match.fixture.status.short === 'FT';
      const type = isFinished ? 'analysis' : 'preview';
      
      // သတင်းဟောင်း မဖြစ်အောင် ID ကို သေချာပေးမယ်
      const originalId = `fb_match_${match.fixture.id}_${type}`;
      const exists = await Post.findOne({ originalId });
      
      if (exists) continue;

      // Gemini ဆီကနေ မြန်မာလို content ယူမယ်
      const content = await generateContent(match, type);
      
      const newPost = await Post.create({
        originalId,
        title: `${match.teams.home.name} vs ${match.teams.away.name}`,
        content,
        imageUrl: match.league.logo, // ပွဲစဉ် Logo သုံးမယ်
        type: type
      });

      // Admin ဆီ ပို့မယ်
      await bot.api.sendMessage(process.env.ADMIN_ID, content, {
        reply_markup: {
          inline_keyboard: [
            [{ text: "✅ Approve", callback_data: `app_${newPost._id}` }],
            [{ text: "❌ Reject", callback_data: `rej_${newPost._id}` }]
          ]
        }
      });
    }
    
    res.status(200).send('Football Matches Processed Successfully');
  } catch (err) {
    res.status(500).send("Football API Error: " + err.message);
  }
}
