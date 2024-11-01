require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});
const { handlePingCommand, handleTimeCommand, handleHelpCommand, handleUnknownCommand, handleTimerCommand } = require('./functions');

client.on('ready', () => {
    console.log('I am ready!');
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content.startsWith('!clockwatch')) {
        // Split the message into an array of words
        const args = message.content.split(' ');
        const command = args[1];

        // Log the message to the console for debugging
        console.log('-----------------------------------------------');
        console.log(message.author.username + ': ' + message.content);
        let served = false;

        // Handle the command if it is recognized
        switch (command) {
            case 'ping':
                served = await handlePingCommand(message, args);
                break;
            case 'time':
                served = await handleTimeCommand(message, args);
                break;
            case 'help':
                served = await handleHelpCommand(message);
                break;
            case 'timer':
                served = await handleTimerCommand(message, args);
                break;
            /* 
            alarm command - requires end time, timezone, and message to ping

            bell command - requires voice, rings every hour
            */
            default:
                served = await handleUnknownCommand(message);
                break;
        }

        // Log serve status
        if (served) {
            console.log('Served command:', command);
        } else {
            console.log('Failed to serve command:', command);
        }
    }
});




client.login(process.env.DISCORD_TOKEN).catch(console.error);