const {Client, GatewayIntentBits} = require('discord.js')
const WOKCommands = require('wokcommands')
const dotenv = require('dotenv').config({path: __dirname + '/.env'});
const path = require('path')

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions
    ]
})

client.on('ready', () => {
  new WOKCommands(client, {
    commandsDir: path.join(__dirname, 'commands'),
    mongoUri: process.env.MONGO_URI
  })
})

// client.login(process.env.TOKEN)

client.login(process.env.TOKEN);