const { Client, Intents } = require('discord.js');
const { google } = require('googleapis');
const axios = require('axios');
const fetch = require('node-fetch');


const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

const API_KEY = 'api key here';
const SEARCH_ENGINE_ID = 'search engine id here';

const keepAlive = require('./alive.js');
keepAlive();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  client.application.commands.create({
    name: 'image',
    description: 'Searches image online',
    options: [
      {
        name: 'query',
        description: 'The search query',
        type: 'STRING',
        required: true,
      },
    ],
  });
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'image') {
    const query = interaction.options.getString('query');

    // Check if the channel is NSFW
    if (!interaction.channel.nsfw) {
      return interaction.reply({ content: 'This command can only be used in NSFW channels.', ephemeral: true });
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

      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      interaction.reply({ content: 'Something went wrong!', ephemeral: true });
    }
  }
});


client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith('!image')) return;

  const query = message.content.slice(6).trim();
  if (!query) return message.reply('Please provide a search query!');

  // Check if the channel is NSFW
  if (!message.channel.nsfw) {
    return message.reply('This command can only be used in NSFW channels.');
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

client.login('bot token here');
