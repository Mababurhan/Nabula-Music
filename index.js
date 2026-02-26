require('dotenv').config();
const express = require('express');
const session = require('express-session');
const { Client, GatewayIntentBits } = require('discord.js');

const app = express();
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'nebula-secret',
  resave: false,
  saveUninitialized: false
}));

// ===== HOME PAGE =====
app.get('/', (req, res) => {
  res.send(`<h1>🚀 Nebula Dashboard</h1><a href="/login">Login with Discord</a>`);
});

// ===== DISCORD LOGIN =====
app.get('/login', (req, res) => {
  const redirect = `https://discord.com/api/oauth2/authorize?client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}&response_type=code&scope=identify%20guilds`;
  res.redirect(redirect);
});

// ===== CALLBACK =====
app.get('/callback', async (req, res) => {
  res.send("Login successful! Dashboard coming soon 🚀");
});

// ===== DASHBOARD =====
app.get('/dashboard', (req, res) => {
  res.render('dashboard');
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.login(process.env.TOKEN);

app.listen(3000, () => console.log('Dashboard running on port 3000'));
require('dotenv').config();
const express = require('express');
const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus
} = require('@discordjs/voice');
const play = require('play-dl');

const app = express();
app.get('/', (req, res) => res.send('Nebula Music Bot is Running 🚀'));
app.listen(3000);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

let player;
let connection;
let currentResource;

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  if (message.content.startsWith('!play')) {
    const query = message.content.split(' ').slice(1).join(' ');
    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel)
      return message.reply("دەبێت لە voice channel بیت!");

    connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator
    });

    const stream = await play.stream(query);
    currentResource = createAudioResource(stream.stream, {
      inputType: stream.type
    });

    player = createAudioPlayer();
    player.play(currentResource);
    connection.subscribe(player);

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('pause').setLabel('⏸ Pause').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('resume').setLabel('▶ Resume').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('skip').setLabel('⏭ Skip').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('stop').setLabel('⛔ Stop').setStyle(ButtonStyle.Danger)
    );

    message.reply({ content: "🎵 Playing...", components: [buttons] });
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  if (!player) return;

  if (interaction.customId === 'pause') {
    player.pause();
    interaction.reply({ content: "⏸ Paused", ephemeral: true });
  }

  if (interaction.customId === 'resume') {
    player.unpause();
    interaction.reply({ content: "▶ Resumed", ephemeral: true });
  }

  if (interaction.customId === 'skip') {
    player.stop();
    interaction.reply({ content: "⏭ Skipped", ephemeral: true });
  }

  if (interaction.customId === 'stop') {
    player.stop();
    if (connection) connection.destroy();
    interaction.reply({ content: "⛔ Stopped", ephemeral: true });
  }
});

client.login(process.env.TOKEN);
