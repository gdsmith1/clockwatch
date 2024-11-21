const { sendMessage } = require('./discord');
const { v4: uuidv4 } = require('uuid');

let activeTimers = {};

async function handlePingCommand(message, args) {
    if (args.length < 3) {
        console.log('ping received... pong!');
        try {
            await sendMessage(message, 'pong!');
        } catch (error) {
            console.error('Error sending pong message:', error);
            return false;
        }
        return true;
    }
    console.log('ping received... but no pong for you! too many arguments');
    return false;
}

async function handleTimeCommand(message, args) {
    console.log('time received');
    if (args.length > 2) {
        for(let i = 2; i < args.length; i++) {
            const timezone = args[i];
            try { // Attempt to get the current time in the provided timezone
                const time = new Date().toLocaleTimeString('en-US', { timeZone: timezone });
                await sendMessage(message, `The current time in ${timezone} is: ${time}`);
                console.log(`Time sent for timezone: ${timezone}`);
            } catch (e) { // Handle invalid timezones
                console.error('Invalid timezone:', timezone);
                try {
                    await sendMessage(message, `${timezone} is not a timezone. (Example: utc)`);
                    console.log('Invalid timezone message sent');
                } catch (error) {
                    console.error('Error sending invalid timezone message:', error);
                    return false;
                }
            }
        }
        return true;
    } else { // Prompt the user to provide a timezone
        try {
            await sendMessage(message, 'Please provide a timezone.');
            console.log('Timezone prompt sent');
        } catch (error) {
            console.error('Error sending timezone prompt:', error);
            return false;
        }
        return true;
    }
}

async function handleUnknownCommand(message) {
    try {
        await sendMessage(message, 'Unknown command - use `!clockwatch help` for a list of commands.');
        console.log('Unknown command message sent');
    } catch (error) {
        console.error('Error sending unknown command message:', error);
        return false;
    }
    return true;
}

async function handleHelpCommand(message) {
    try {
        await sendMessage(
            message,
            'Available commands:\n' +
            '`!clockwatch ping` - check if the bot is online\n' +
            '`!clockwatch time [timezone]` - get the current time in a timezone\n' +
            '`!clockwatch timer [duration] [unit]` - set a timer for a duration (e.g., 5 min, 2 hours)\n' +
            '`!clockwatch soon [unit]` - set a timer for a random duration (seconds for up to 15 minutes, minutes for up to 90 minutes, hours for up to 6 hours )\n' +
            '`!clockwatch show` - shows all active timers and alarms\n' +
            '`!clockwatch reset` - reset all timers'
        );
        console.log('Help message sent');
    } catch (error) {
        console.error('Error sending help message:', error);
        return false;
    }
    return true;
}

async function handleTimerCommand(message, args) {
    if (args.length < 4) {
        try {
            await sendMessage(message, 'Please provide a duration and unit (e.g., 5 min, 2 hours).');
            return true;
        }
        catch (error) {
            console.error('Error sending timer prompt:', error);
            return false;
        }
    }

    const duration = parseInt(args[2]);
    const unit = args[3].toLowerCase();

    if (isNaN(duration) || duration <= 0) {
        try {
            await sendMessage(message, 'Invalid duration. Please provide a positive whole number.');
            return true;
        }
        catch (error) {
            console.error('Error sending invalid duration message:', error);
            return false;
        }
    }

    let milliseconds;
    switch (unit) {
        case 'sec':
        case 'second':
        case 'seconds':
            milliseconds = duration * 1000;
            break;
        case 'min':
        case 'minute':
        case 'minutes':
            milliseconds = duration * 60 * 1000;
            break;
        case 'hour':
        case 'hours':
            milliseconds = duration * 60 * 60 * 1000;
            break;
        default:
            try {
                await sendMessage(message, 'Invalid unit. Please use seconds, minutes, or hours.');
                return true;
            }
            catch (error) {
                console.error('Error sending unit message:', error);
                return false;
            }
    }

    if (milliseconds > 86400000) {
        try {
            await sendMessage(message, 'Duration is too long. Please provide a time less than 24 hours.');
        }
        catch (error) {
            console.error('Error sending duration message:', error);
            return false;
        }
        return false;
    }

    const timerId = uuidv4(); // Generate a unique identifier for the timer
    const serverId = message.guild.id;

    if (!activeTimers[serverId]) {
        activeTimers[serverId] = [];
    }

    try {
        await sendMessage(message, `Timer set for ${duration} ${unit}.`);
        activeTimers[serverId].push({ id: timerId, user: message.author.username, duration, unit, endTime: Date.now() + milliseconds });
    }
    catch (error) {
        console.error('Error sending timer message:', error);
        return false;
    }

    setTimeout(async () => {
        try {
            const timer = activeTimers[serverId].find(timer => timer.id === timerId);
            if (timer) {
                await sendMessage(message, `<@${message.author.id}> : ${duration} ${unit} have passed.`);
                activeTimers[serverId] = activeTimers[serverId].filter(timer => timer.endTime > Date.now());
            }
        }
        catch (error) {
            console.error('Error sending timer message:', error);
            return false;
        }
    }, milliseconds);

    return true;
}

async function handleShowCommand(message) {
    const serverId = message.guild.id;
    try {
        if (!activeTimers[serverId] || activeTimers[serverId].length === 0) {
            await sendMessage(message, 'No active timers.');
        } else {
            let timerList = 'Active timers:\n';
            activeTimers[serverId].forEach(timer => {
                const timeLeftInMinutes = Math.round((timer.endTime - Date.now()) / 60000); // Convert milliseconds to minutes
                timerList += `${timer.user}: ${timer.duration} ${timer.unit} (ends in ${timeLeftInMinutes} minutes)\n`;
            });
            await sendMessage(message, timerList);
        }
        console.log('Show command message sent');
    } catch (error) {
        console.error('Error sending show command message:', error);
        return false;
    }
    return true;
}

async function handleResetCommand(message) {
    const serverId = message.guild.id;
    activeTimers[serverId] = [];
    try {
        await sendMessage(message, 'All timers reset.');
        console.log('Reset command message sent');
    } catch (error) {
        console.error('Error sending reset command message:', error);
        return false;
    }
    return true;
}

async function handleSoonCommand(message, args) {
    if (args.length < 3) {
        try {
            await sendMessage(message, 'Please provide a unit (seconds for up to 15 minutes, minutes for up to 90 minutes, or hours for up to 6 hours).');
            return true;
        }
        catch (error) {
            console.error('Error sending unit prompt:', error);
            return false;
        }
    }

    const unit = args[2].toLowerCase();
    let maxDuration;
    let unitLabel;

    switch (unit) {
        case 'sec':
        case 'second':
        case 'seconds':
            maxDuration = 900; // Maximum 15 minutes
            unitLabel = 'seconds';
            break;
        case 'min':
        case 'minute':
        case 'minutes':
            maxDuration = 90; // Maximum 90 minutes
            unitLabel = 'minutes';
            break;
        case 'hour':
        case 'hours':
            maxDuration = 6; // Maximum 6 hours
            unitLabel = 'hours';
            break;
        default:
            try {
                await sendMessage(message, 'Invalid unit. Please use seconds, minutes, or hours.');
                return true;
            }
            catch (error) {
                console.error('Error sending invalid unit message:', error);
                return false;
            }
    }

    const duration = Math.floor(Math.random() * maxDuration) + 1; // Random duration between 1 and maxDuration
    let milliseconds;

    switch (unitLabel) {
        case 'seconds':
            milliseconds = duration * 1000;
            break;
        case 'minutes':
            milliseconds = duration * 60 * 1000;
            break;
        case 'hours':
            milliseconds = duration * 60 * 60 * 1000;
            break;
    }

    const timerId = uuidv4(); // Generate a unique identifier for the timer
    const serverId = message.guild.id;

    if (!activeTimers[serverId]) {
        activeTimers[serverId] = [];
    }

    try {
        await sendMessage(message, `Timer set for a random duration of ${duration} ${unitLabel}.`);
        activeTimers[serverId].push({ id: timerId, user: message.author.username, duration, unit: unitLabel, endTime: Date.now() + milliseconds });
    }
    catch (error) {
        console.error('Error sending timer message:', error);
        return false;
    }

    setTimeout(async () => {
        try {
            const timer = activeTimers[serverId].find(timer => timer.id === timerId);
            if (timer) {
                await sendMessage(message, `<@${message.author.id}> : ${duration} ${unitLabel} have passed.`);
                activeTimers[serverId] = activeTimers[serverId].filter(timer => timer.endTime > Date.now());
            }
        }
        catch (error) {
            console.error('Error sending timer message:', error);
            return false;
        }
    }, milliseconds);

    return true;
}

//async function handleAlarmCommand(message, args) {}


module.exports = {
    handlePingCommand,
    handleTimeCommand,
    handleUnknownCommand,
    handleHelpCommand,
    handleTimerCommand,
    handleShowCommand,
    handleResetCommand,
    handleSoonCommand,
    //handleAlarmCommand,
};