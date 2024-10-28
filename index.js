const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.on('ready', () => {
  console.log('I am ready!');
});

client.on('messageCreate', (message) => {
  if (message.content.startsWith('ping')) {
    console.log('ping received');
    message.channel.send('pong!');
  }
});

client.login('');