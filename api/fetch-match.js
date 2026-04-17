const { Bot } = require('grammY');
const dbConnect = require('../utils/db');
const Post = require('../models/Post');
const { generateContent } = require('../utils/gemini');

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);

export default async function handler(req, res) {
  await dbConnect();
  const apiKey = process.env.FOOTBALL_API_KEY;

  // ဥပမာ - ဒီနေ့ပွဲစဉ်တွေယူမယ် (Live သို့မဟုတ် Fixtures)
  try {
    const response = await fetch('https://v3.football.api-sports.io/fixtures?date=2026-04-17&league=39', {
      headers: { 'x-apisports-key': apiKey }
    });
    const { response: matches } = await response.json();

    for (const match of matches) {
      const isFinished = match.fixture.status.short === 'FT';
      const type = isFinished ? 'analysis' : 'preview';
      const originalId = `match_${match.fixture.id}_${type}`;

      const exists = await Post.findOne({ originalId });
      if (exists) continue;

      const content = await generateContent(match, type);
      
      const newPost = await Post.create({
        originalId,
        title: `${match.teams.home.name} vs ${match.teams.away.name}`,
        content,
        imageUrl: match.league.logo,
        type: type
      });

      // Admin ဆီ ပို့မယ်
      await bot.api.sendMessage(process.env.ADMIN_ID, `⚽ ${type.toUpperCase()}:\n\n${content}\n\n/approve_${newPost._id}`);
    }
    res.status(200).send('Matches Processed');
  } catch (err) {
    res.status(500).send(err.message);
  }
}
