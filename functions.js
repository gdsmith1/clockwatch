


function handlePingCommand(message, args) {
    if (args.length == 2) {
        console.log('ping received... pong!');
        try {
            sendMessage(message, 'pong!');
        } catch (error) {
            console.error('Error sending pong message:', error);
        }
        return true;
    }
    return false;
}

function handleTimeCommand(message, args) {
    console.log('time received');
    if (args.length > 2) {
        for(let i = 2; i < args.length; i++) {
            const timezone = args[i];
            try { // Attempt to get the current time in the provided timezone
                const time = new Date().toLocaleTimeString('en-US', { timeZone: timezone });
                sendMessage(message, `The current time in ${timezone} is: ${time}`);
                console.log(`Time sent for timezone: ${timezone}`);
            } catch (e) { // Handle invalid timezones
                console.error('Invalid timezone:', timezone);
                try {
                    sendMessage(message, `${timezone} is not a timezone. (Example: utc)`);
                    console.log('Invalid timezone message sent');
                } catch (error) {
                    console.error('Error sending invalid timezone message:', error);
                }
            }
        }
        return true;
    } else { // Prompt the user to provide a timezone
        try {
            sendMessage(message, 'Please provide a timezone.');
            console.log('Timezone prompt sent');
        } catch (error) {
            console.error('Error sending timezone prompt:', error);
        }
        return true;
    }
}

function handleUnknownCommand(message) {
    try {
        sendMessage(message, 'Unknown command - use `!clockwatch help` for a list of commands.');
        console.log('Unknown command message sent');
    } catch (error) {
        console.error('Error sending unknown command message:', error);
    }
    return true;
}

function handleHelpCommand(message) {
    try {
        sendMessage(
            message,
            'Available commands:\n' +
            '`!clockwatch ping` - check if the bot is online\n' +
            '`!clockwatch time [timezone]` - get the current time in a timezone'
        );
        console.log('Help message sent');
    } catch (error) {
        console.error('Error sending help message:', error);
    }
    return true;
}


function sendMessage(message, content) {
    message.channel.send(content)
        .then(() => console.log('Message sent'))
        .catch(console.error);
}

module.exports = {
    handlePingCommand,
    handleTimeCommand,
    handleUnknownCommand,
    handleHelpCommand,
    sendMessage
};