const { Bot, webhookCallback } = require('grammy');
const dbConnect = require('../utils/db');
const Post = require('../models/Post');

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);

bot.on("callback_query:data", async (ctx) => {
  await dbConnect();
  const [action, postId] = ctx.callbackQuery.data.split("_");
  const post = await Post.findById(postId);

  if (!post || post.status !== 'pending') return ctx.answerCallbackQuery("Post မရှိတော့ပါ သို့မဟုတ် တင်ပြီးသားပါ။");

  if (action === "app") {
    // Channel ကို ပို့မယ်
    if (post.imageUrl) {
      await bot.api.sendPhoto(process.env.CHANNEL_ID, post.imageUrl, { caption: post.content });
    } else {
      await bot.api.sendMessage(process.env.CHANNEL_ID, post.content);
    }
    post.status = 'posted';
    await post.save();
    await ctx.editMessageText(`✅ Channel ထဲသို့ တင်ပြီးပါပြီ။`);
  } else {
    post.status = 'rejected';
    await post.save();
    await ctx.editMessageText("❌ ပယ်ဖျက်လိုက်ပါသည်။");
  }
  await ctx.answerCallbackQuery();
});

export default webhookCallback(bot, "http");
