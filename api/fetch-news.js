const { Bot, InlineKeyboard } = require('grammy');
const dbConnect = require('../utils/db');
const Post = require('../models/Post');
const { generateContent } = require('../utils/gemini');

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);

export default async function handler(req, res) {
  console.log("--- Fetch News Process Started ---");
  
  try {
    await dbConnect();
    console.log("DB Connected Successfully");

    const newsUrl = `https://newsdata.io/api/1/news?apikey=${process.env.NEWSDATA_KEY}&q=football&category=sports&language=en`;
    const response = await fetch(newsUrl);
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      console.log("No news found from NewsData API");
      return res.status(200).json({ message: "No news found" });
    }

    console.log(`Found ${data.results.length} news items. Processing top 3...`);
    const topThreeNews = data.results.slice(0, 3);

    for (const [index, item] of topThreeNews.entries()) {
      console.log(`Processing Item ${index + 1}: ${item.title}`);

      const exists = await Post.findOne({ originalId: item.article_id || item.link });
      if (exists) {
        console.log(`Item ${index + 1} already exists in DB. Skipping...`);
        continue;
      }

      console.log(`Calling Gemini for Item ${index + 1}...`);
      const burmeseContent = await generateContent(item, 'news');
      console.log(`Gemini response received for Item ${index + 1}`);

      const newPost = await Post.create({
        originalId: item.article_id || item.link,
        title: item.title,
        content: burmeseContent,
        imageUrl: item.image_url,
        type: 'news'
      });

      // Telegram ကို ပို့မယ်
      const keyboard = new InlineKeyboard()
        .text("✅ Approve", `app_${newPost._id}`)
        .text("❌ Reject", `rej_${newPost._id}`);
      
      const messageText = `📰 **${item.title}**\n\n${burmeseContent}`;

      try {
        if (newPost.imageUrl) {
          await bot.api.sendPhoto(process.env.ADMIN_ID, newPost.imageUrl, { 
            caption: messageText.substring(0, 1024),
            reply_markup: keyboard 
          });
        } else {
          await bot.api.sendMessage(process.env.ADMIN_ID, messageText, { 
            reply_markup: keyboard 
          });
        }
        console.log(`Message sent to Telegram for Item ${index + 1}`);
      } catch (tgErr) {
        console.error(`Telegram Send Error (Item ${index + 1}):`, tgErr.message);
      }
    }

    console.log("--- Process Completed ---");
    res.status(200).json({ success: true });

  } catch (err) {
    console.error("CRITICAL ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
}
