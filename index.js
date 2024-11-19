require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});
const { handlePingCommand, handleTimeCommand, handleHelpCommand, handleUnknownCommand, handleTimerCommand, handleShowCommand, handleResetCommand, handleSoonCommand } = require('./functions');

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
            case 'show':
                served = await handleShowCommand(message);
                break;
            case 'reset':
                served = await handleResetCommand(message);
                break;
            case 'soon':
                served = await handleSoonCommand(message, args);
                break;
            /* 
            alarm command - requires end time, timezone, and message to ping

            bell command - requires voice, rings every hour

            soon command - choose mins or hours - random time

            show command - shows all active timers

            movespam command - moves a user between channels to spam them

            logs command - shows the logs of the server
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

// Handle discord errors and reconnect
client.on('error', (err) => {
    console.error('Discord client error:', err);
    retryConnection();
});

client.on('reconnecting', () => {
    console.log('Reconnecting to Discord...');
});

client.on('disconnect', (event) => {
    console.log('Disconnected from Discord:', event);
    retryConnection();
});

function retryConnection() {
    console.log('Attempting to reconnect...');
    client.login(process.env.DISCORD_TOKEN).catch((err) => {
        console.error('Failed to reconnect:', err);
        setTimeout(retryConnection, 5000); // Retry after 5 seconds
    });
}

client.login(process.env.DISCORD_TOKEN).catch((err) => {
    console.error('Failed to login with bot token:', err);
    retryConnection();
});

// Handle global errors
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception thrown:', err);
    retryConnection();
});