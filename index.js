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
