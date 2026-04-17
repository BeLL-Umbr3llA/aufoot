const { Bot, InlineKeyboard } = require('grammy');
const dbConnect = require('../utils/db');
const Post = require('../models/Post');
const { generateContent } = require('../utils/gemini');

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);

export default async function handler(req, res) {
  await dbConnect();
  
  try {
    const response = await fetch(`https://newsdata.io/api/1/news?apikey=${process.env.NEWSDATA_KEY}&q=football&category=sports&language=en`);
    const data = await response.json();

    // သတင်း ၁၀ ခုလာပေမယ့် အရှေ့ဆုံး ၃ ခုကိုပဲ ယူမယ်
    const topThreeNews = data.results.slice(0, 3);

    for (const item of topThreeNews) {
      const exists = await Post.findOne({ originalId: item.article_id || item.link });
      if (exists) continue;

      // Gemini API ကို လှမ်းခေါ်မယ်
      const burmeseContent = await generateContent(item, 'news');

      // DB ထဲ သိမ်းမယ်
      const newPost = await Post.create({
        originalId: item.article_id || item.link,
        title: item.title,
        content: burmeseContent,
        imageUrl: item.image_url,
        type: 'news'
      });

      // Admin ဆီ ပို့မယ်
      const keyboard = new InlineKeyboard()
        .text("✅ Approve", `app_${newPost._id}`)
        .text("❌ Reject", `rej_${newPost._id}`);
      
      const messageText = `📰 **${item.title}**\n\n${burmeseContent}`;

      if (newPost.imageUrl) {
        await bot.api.sendPhoto(process.env.ADMIN_ID, newPost.imageUrl, { 
          caption: messageText.substring(0, 1024), // Telegram caption limit
          reply_markup: keyboard 
        });
      } else {
        await bot.api.sendMessage(process.env.ADMIN_ID, messageText, { 
          reply_markup: keyboard 
        });
      }
    }
    res.status(200).json({ success: true, message: "Processed 3 news items." });
  } catch (err) {
    console.error("Fetch News Error:", err);
    res.status(500).json({ error: err.message });
  }
}
