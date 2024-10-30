const {
    handlePingCommand,
    handleTimeCommand,
    handleUnknownCommand,
    handleHelpCommand,
} = require('./functions');

const { sendMessage } = require('./discord');

jest.mock('./discord', () => ({
    sendMessage: jest.fn(),
}));

beforeEach(() => {
    jest.clearAllMocks();
});

describe('handlePingCommand', () => {
    it('should respond with pong when args length is 2', async () => {
        const message = { channel: { send: jest.fn() } };
        const args = ['!clockwatch', 'ping'];

        const result = await handlePingCommand(message, args);

        expect(result).toBe(true);
        expect(sendMessage).toHaveBeenCalledWith(message, 'pong!');
    });

    it('should return false when args length is greater than 2', async () => {
        const message = { channel: { send: jest.fn() } };
        const args = ['!clockwatch', 'ping', 'extra'];

        const result = await handlePingCommand(message, args);

        expect(result).toBe(false);
        expect(sendMessage).not.toHaveBeenCalled();
    });
});

    describe('handleTimeCommand', () => {
        it('should prompt for timezone when args length is less than 3', async () => {
            const message = { channel: { send: jest.fn() } };
            const args = ['!clockwatch', 'time'];

            const result = await handleTimeCommand(message, args);

            expect(result).toBe(true);
            expect(sendMessage).toHaveBeenCalledWith(message, 'Please provide a timezone.');
        });

        it('should send current time for valid timezone', async () => {
            const message = { channel: { send: jest.fn() } };
            const args = ['!clockwatch', 'time', 'UTC'];

            const result = await handleTimeCommand(message, args);

            expect(result).toBe(true);
            expect(sendMessage).toHaveBeenCalledWith(
                message,
                expect.stringContaining('The current time in UTC is:')
            );
        });

        it('should handle invalid timezone', async () => {
            const message = { channel: { send: jest.fn() } };
            const args = ['!clockwatch', 'time', 'Invalid/Timezone'];

            const result = await handleTimeCommand(message, args);

            expect(result).toBe(true);
            expect(sendMessage).toHaveBeenCalledWith(
                message,
                'Invalid/Timezone is not a timezone. (Example: utc)'
            );
        });
    });

    describe('handleUnknownCommand', () => {
        it('should respond with unknown command message', async () => {
            const message = { channel: { send: jest.fn() } };

            const result = await handleUnknownCommand(message);

            expect(result).toBe(true);
            expect(sendMessage).toHaveBeenCalledWith(
                message,
                'Unknown command - use `!clockwatch help` for a list of commands.'
            );
        });
    });

describe('handleHelpCommand', () => {
    it('should respond with help message', async () => {
        const message = { channel: { send: jest.fn() } };

        const result = await handleHelpCommand(message);

        expect(result).toBe(true);
        expect(sendMessage).toHaveBeenCalledWith(
            message,
            'Available commands:\n' +
            '`!clockwatch ping` - check if the bot is online\n' +
            '`!clockwatch time [timezone]` - get the current time in a timezone'
        );
    });
});


