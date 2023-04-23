const { Client, Intents } = require('discord.js');
const { google } = require('googleapis');
const axios = require('axios');

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

const API_KEY = 'google custom search api key here';
const SEARCH_ENGINE_ID = 'google custom search engine ID here';

const keepAlive = require('./alive.js');
keepAlive();

client.once('ready', () => {
  console.log('Bot is ready!');
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith('!image')) return;

  const query = message.content.slice(6).trim();
  if (!query) return message.reply('Please provide a search query!');

  // Check if the message was sent in an NSFW channel
  if (message.channel.type !== 'GUILD_TEXT' || !message.channel.nsfw) {
    return message.reply('Sorry, this command is only available in NSFW channels.');
  }

  try {
    const result = await google.customsearch('v1').cse.list({
      auth: API_KEY,
      cx: SEARCH_ENGINE_ID,
      q: query,
      searchType: 'image',
    });

    const randomIndex = Math.floor(Math.random() * result.data.items.length);
    const imageUrl = result.data.items[randomIndex].link;

    const embed = {
      title: query,
      image: { url: imageUrl },
    };

    await message.channel.send({ embeds: [embed] });
  } catch (err) {
    console.error(err);
    message.reply('Something went wrong!');
  }
});

client.login('place bot token here');
