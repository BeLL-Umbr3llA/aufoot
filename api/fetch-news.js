const { Bot, InlineKeyboard } = require('grammY');
const dbConnect = require('../utils/db');
const Post = require('../models/Post');
const { generateContent } = require('../utils/gemini');

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);

export default async function handler(req, res) {
  await dbConnect();
  
  try {
    const response = await fetch(`https://newsdata.io/api/1/news?apikey=${process.env.NEWSDATA_KEY}&q=football&category=sports&language=en`);
    const data = await response.json();

    for (const item of data.results) {
      // ၁။ သတင်းဟောင်း ဟုတ်မဟုတ် စစ်မယ်
      const exists = await Post.findOne({ originalId: item.article_id || item.link });
      if (exists) continue;

      // ၂။ Gemini နဲ့ မြန်မာလို ပြန်မယ်
      const burmeseContent = await generateContent(item, 'news');

      // ၃။ DB ထဲ သိမ်းမယ်
      const newPost = await Post.create({
        originalId: item.article_id || item.link,
        title: item.title,
        content: burmeseContent,
        imageUrl: item.image_url,
        type: 'news'
      });

      // ၄။ Admin ဆီကို Buttons နဲ့ အသိပေးမယ်
      const keyboard = new InlineKeyboard().text("✅ Approve", `app_${newPost._id}`).text("❌ Reject", `rej_${newPost._id}`);
      
      if (newPost.imageUrl) {
        await bot.api.sendPhoto(process.env.ADMIN_ID, newPost.imageUrl, { caption: burmeseContent, reply_markup: keyboard });
      } else {
        await bot.api.sendMessage(process.env.ADMIN_ID, burmeseContent, { reply_markup: keyboard });
      }
    }
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
