const {
  handlePingCommand,
  handleTimeCommand,
  handleUnknownCommand,
  handleHelpCommand,
  handleTimerCommand,
  handleShowCommand,
  handleResetCommand,
  handleSoonCommand,
  handleGlobalHelp,
} = require("./functions");

const { sendMessage } = require("./discord");

jest.mock("./discord", () => ({
  sendMessage: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterAll(() => {
  console.error.mockRestore();
});

describe("handleGlobalHelpCommand", () => {
  it("should respond with help message", async () => {
    const message = { channel: { send: jest.fn() }, guild: { id: "guild123" } };
    const result = await handleGlobalHelp(message);
    expect(result).toBe(true);
    expect(sendMessage).toHaveBeenCalledWith(
      message,
      "For help with this bot, use `!clockwatch help`.",
    );
  });

  it("should handle error when sending global help message", async () => {
    const message = { channel: { send: jest.fn() }, guild: { id: "guild123" } };
    sendMessage.mockImplementationOnce(() => {
      throw new Error("Mocked error");
    });
    const result = await handleGlobalHelp(message);
    expect(result).toBe(false);
  });
});

describe("handlePingCommand", () => {
  it("should respond with pong when args length is 2", async () => {
    const message = { channel: { send: jest.fn() }, guild: { id: "guild123" } };
    const args = ["!clockwatch", "ping"];

    const result = await handlePingCommand(message, args);

    expect(result).toBe(true);
    expect(sendMessage).toHaveBeenCalledWith(message, "pong!");
  });

  it("should return false when args length is greater than 2", async () => {
    const message = { channel: { send: jest.fn() }, guild: { id: "guild123" } };
    const args = ["!clockwatch", "ping", "extra"];

    const result = await handlePingCommand(message, args);

    expect(result).toBe(false);
    expect(sendMessage).not.toHaveBeenCalled();
  });

  it("should handle error when sending pong message", async () => {
    const message = { channel: { send: jest.fn() }, guild: { id: "guild123" } };
    const args = ["!clockwatch", "ping"];

    sendMessage.mockImplementationOnce(() => {
      throw new Error("Mocked error");
    });

    const result = await handlePingCommand(message, args);

    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalledWith(
      "Error sending pong message:",
      expect.any(Error),
    );
  });
});

describe("handleTimeCommand", () => {
  it("should prompt for timezone when args length is less than 3", async () => {
    const message = { channel: { send: jest.fn() }, guild: { id: "guild123" } };
    const args = ["!clockwatch", "time"];

    const result = await handleTimeCommand(message, args);

    expect(result).toBe(true);
    expect(sendMessage).toHaveBeenCalledWith(
      message,
      "Please provide a timezone.",
    );
  });

  it("should send current time for valid timezone", async () => {
    const message = { channel: { send: jest.fn() }, guild: { id: "guild123" } };
    const args = ["!clockwatch", "time", "UTC"];

    const result = await handleTimeCommand(message, args);

    expect(result).toBe(true);
    expect(sendMessage).toHaveBeenCalledWith(
      message,
      expect.stringContaining("The current time in UTC is:"),
    );
  });

  it("should handle invalid timezone", async () => {
    const message = { channel: { send: jest.fn() }, guild: { id: "guild123" } };
    const args = ["!clockwatch", "time", "Invalid/Timezone"];

    const result = await handleTimeCommand(message, args);

    expect(result).toBe(true);
    expect(sendMessage).toHaveBeenCalledWith(
      message,
      "Invalid/Timezone is not a timezone. (Example: utc)",
    );
  });

  it("should handle error when sending timezone prompt", async () => {
    const message = { channel: { send: jest.fn() }, guild: { id: "guild123" } };
    const args = ["!clockwatch", "time"];

    sendMessage.mockImplementationOnce(() => {
      throw new Error("Mocked error");
    });

    const result = await handleTimeCommand(message, args);

    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalledWith(
      "Error sending timezone prompt:",
      expect.any(Error),
    );
  });

  it("should handle error when sending invalid timezone message", async () => {
    const message = { channel: { send: jest.fn() }, guild: { id: "guild123" } };
    const args = ["!clockwatch", "time", "Invalid/Timezone"];

    sendMessage.mockImplementationOnce(() => {
      throw new Error("Mocked error");
    });

    const result = await handleTimeCommand(message, args);

    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalledWith(
      "Error sending invalid timezone message:",
      expect.any(Error),
    );
  });
});

describe("handleUnknownCommand", () => {
  it("should respond with unknown command message", async () => {
    const message = { channel: { send: jest.fn() }, guild: { id: "guild123" } };

    const result = await handleUnknownCommand(message);

    expect(result).toBe(true);
    expect(sendMessage).toHaveBeenCalledWith(
      message,
      "Unknown command - use `!clockwatch help` for a list of commands.",
    );
  });

  it("should handle error when sending unknown command message", async () => {
    const message = { channel: { send: jest.fn() }, guild: { id: "guild123" } };

    sendMessage.mockImplementationOnce(() => {
      throw new Error("Mocked error");
    });

    const result = await handleUnknownCommand(message);

    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalledWith(
      "Error sending unknown command message:",
      expect.any(Error),
    );
  });
});

describe("handleHelpCommand", () => {
  it("should respond with help message", async () => {
    const message = { channel: { send: jest.fn() }, guild: { id: "guild123" } };
    const result = await handleHelpCommand(message);

    expect(result).toBe(true);
    expect(sendMessage).toHaveBeenCalledWith(
      message,
      "Available commands:\n" +
        "`!clockwatch ping` - check if the bot is online\n" +
        "`!clockwatch time [timezone]` - get the current time in a timezone\n" +
        "`!clockwatch timer [duration] [unit]` - set a timer for a duration (e.g., 5 min, 2 hours)\n" +
        "`!clockwatch soon [unit]` - set a timer for a random duration (seconds for up to 15 minutes, minutes for up to 90 minutes, hours for up to 6 hours )\n" +
        "`!clockwatch show` - shows all active timers and alarms\n" +
        "`!clockwatch reset` - reset all timers",
    );
  });

  it("should handle error when sending help message", async () => {
    const message = { channel: { send: jest.fn() }, guild: { id: "guild123" } };

    sendMessage.mockImplementationOnce(() => {
      throw new Error("Mocked error");
    });

    const result = await handleHelpCommand(message);

    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalledWith(
      "Error sending help message:",
      expect.any(Error),
    );
  });
});

describe("handleTimerCommand", () => {
  it("should prompt for duration and unit when args length is less than 4", async () => {
    const message = { channel: { send: jest.fn() }, guild: { id: "guild123" } };
    const args = ["!clockwatch", "timer"];

    const result = await handleTimerCommand(message, args);

    expect(result).toBe(true);
    expect(sendMessage).toHaveBeenCalledWith(
      message,
      "Please provide a duration and unit (e.g., 5 min, 2 hours).",
    );
  });

  it("should respond with invalid duration message for non-numeric duration", async () => {
    const message = { channel: { send: jest.fn() }, guild: { id: "guild123" } };
    const args = ["!clockwatch", "timer", "abc", "min"];

    const result = await handleTimerCommand(message, args);

    expect(result).toBe(true);
    expect(sendMessage).toHaveBeenCalledWith(
      message,
      "Invalid duration. Please provide a positive whole number.",
    );
  });

  it("should respond with invalid unit message for unsupported unit", async () => {
    const message = { channel: { send: jest.fn() }, guild: { id: "guild123" } };
    const args = ["!clockwatch", "timer", "5", "days"];

    const result = await handleTimerCommand(message, args);

    expect(result).toBe(true);
    expect(sendMessage).toHaveBeenCalledWith(
      message,
      "Invalid unit. Please use seconds, minutes, or hours.",
    );
  });

  it("should respond with duration too long message for duration greater than 24 hours", async () => {
    const message = { channel: { send: jest.fn() }, guild: { id: "guild123" } };
    const args = ["!clockwatch", "timer", "25", "hours"];

    const result = await handleTimerCommand(message, args);

    expect(result).toBe(false);
    expect(sendMessage).toHaveBeenCalledWith(
      message,
      "Duration is too long. Please provide a time less than 24 hours.",
    );
  });

  it("should set a timer and notify when time is up", async () => {
    jest.useFakeTimers();
    const message = {
      channel: { send: jest.fn() },
      author: { id: "12345" },
      guild: { id: "guild123" },
    };
    const args = ["!clockwatch", "timer", "1", "min"];

    const result = await handleTimerCommand(message, args);

    expect(result).toBe(true);
    expect(sendMessage).toHaveBeenCalledWith(message, "Timer set for 1 min.");

    jest.advanceTimersByTime(60000);

    expect(sendMessage).toHaveBeenCalledWith(
      message,
      "<@12345> : 1 min have passed.",
    );
    jest.useRealTimers();
  });

  it('should handle "sec" unit correctly', async () => {
    jest.useFakeTimers();
    const message = {
      channel: { send: jest.fn() },
      author: { id: "12345" },
      guild: { id: "guild123" },
    };
    const args = ["!clockwatch", "timer", "5", "sec"];

    const result = await handleTimerCommand(message, args);

    expect(result).toBe(true);
    expect(sendMessage).toHaveBeenCalledWith(message, "Timer set for 5 sec.");

    jest.advanceTimersByTime(5000);

    expect(sendMessage).toHaveBeenCalledWith(
      message,
      "<@12345> : 5 sec have passed.",
    );
    jest.useRealTimers();
  });

  it('should handle "second" unit correctly', async () => {
    jest.useFakeTimers();
    const message = {
      channel: { send: jest.fn() },
      author: { id: "12345" },
      guild: { id: "guild123" },
    };
    const args = ["!clockwatch", "timer", "5", "second"];

    const result = await handleTimerCommand(message, args);

    expect(result).toBe(true);
    expect(sendMessage).toHaveBeenCalledWith(
      message,
      "Timer set for 5 second.",
    );

    jest.advanceTimersByTime(5000);

    expect(sendMessage).toHaveBeenCalledWith(
      message,
      "<@12345> : 5 second have passed.",
    );
    jest.useRealTimers();
  });

  it('should handle "seconds" unit correctly', async () => {
    jest.useFakeTimers();
    const message = {
      channel: { send: jest.fn() },
      author: { id: "12345" },
      guild: { id: "guild123" },
    };
    const args = ["!clockwatch", "timer", "5", "seconds"];

    const result = await handleTimerCommand(message, args);

    expect(result).toBe(true);
    expect(sendMessage).toHaveBeenCalledWith(
      message,
      "Timer set for 5 seconds.",
    );

    jest.advanceTimersByTime(5000);

    expect(sendMessage).toHaveBeenCalledWith(
      message,
      "<@12345> : 5 seconds have passed.",
    );
    jest.useRealTimers();
  });

  it('should handle "min" unit correctly', async () => {
    jest.useFakeTimers();
    const message = {
      channel: { send: jest.fn() },
      author: { id: "12345" },
      guild: { id: "guild123" },
    };
    const args = ["!clockwatch", "timer", "5", "min"];

    const result = await handleTimerCommand(message, args);

    expect(result).toBe(true);
    expect(sendMessage).toHaveBeenCalledWith(message, "Timer set for 5 min.");

    jest.advanceTimersByTime(300000);

    expect(sendMessage).toHaveBeenCalledWith(
      message,
      "<@12345> : 5 min have passed.",
    );
    jest.useRealTimers();
  });

  it('should handle "minute" unit correctly', async () => {
    jest.useFakeTimers();
    const message = {
      channel: { send: jest.fn() },
      author: { id: "12345" },
      guild: { id: "guild123" },
    };
    const args = ["!clockwatch", "timer", "5", "minute"];

    const result = await handleTimerCommand(message, args);

    expect(result).toBe(true);
    expect(sendMessage).toHaveBeenCalledWith(
      message,
      "Timer set for 5 minute.",
    );

    jest.advanceTimersByTime(300000);

    expect(sendMessage).toHaveBeenCalledWith(
      message,
      "<@12345> : 5 minute have passed.",
    );
    jest.useRealTimers();
  });

  it('should handle "minutes" unit correctly', async () => {
    jest.useFakeTimers();
    const message = {
      channel: { send: jest.fn() },
      author: { id: "12345" },
      guild: { id: "guild123" },
    };
    const args = ["!clockwatch", "timer", "5", "minutes"];

    const result = await handleTimerCommand(message, args);

    expect(result).toBe(true);
    expect(sendMessage).toHaveBeenCalledWith(
      message,
      "Timer set for 5 minutes.",
    );

    jest.advanceTimersByTime(300000);

    expect(sendMessage).toHaveBeenCalledWith(
      message,
      "<@12345> : 5 minutes have passed.",
    );
    jest.useRealTimers();
  });

  it('should handle "hour" unit correctly', async () => {
    jest.useFakeTimers();
    const message = {
      channel: { send: jest.fn() },
      author: { id: "12345" },
      guild: { id: "guild123" },
    };
    const args = ["!clockwatch", "timer", "1", "hour"];

    const result = await handleTimerCommand(message, args);

    expect(result).toBe(true);
    expect(sendMessage).toHaveBeenCalledWith(message, "Timer set for 1 hour.");

    jest.advanceTimersByTime(3600000);

    expect(sendMessage).toHaveBeenCalledWith(
      message,
      "<@12345> : 1 hour have passed.",
    );
    jest.useRealTimers();
  });

  it('should handle "hours" unit correctly', async () => {
    jest.useFakeTimers();
    const message = {
      channel: { send: jest.fn() },
      author: { id: "12345" },
      guild: { id: "guild123" },
    };
    const args = ["!clockwatch", "timer", "1", "hours"];

    const result = await handleTimerCommand(message, args);

    expect(result).toBe(true);
    expect(sendMessage).toHaveBeenCalledWith(message, "Timer set for 1 hours.");

    jest.advanceTimersByTime(3600000);

    expect(sendMessage).toHaveBeenCalledWith(
      message,
      "<@12345> : 1 hours have passed.",
    );
    jest.useRealTimers();
  });

  it("should handle error when sending invalid unit message", async () => {
    const message = { channel: { send: jest.fn() }, guild: { id: "guild123" } };
    const args = ["!clockwatch", "timer", "5", "invalidUnit"];

    sendMessage.mockImplementationOnce(() => {
      throw new Error("Mocked error");
    });

    const result = await handleTimerCommand(message, args);

    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalledWith(
      "Error sending unit message:",
      expect.any(Error),
    );
  });

  it("should handle error when sending timer message", async () => {
    jest.useFakeTimers();
    const message = {
      channel: { send: jest.fn() },
      author: { id: "12345" },
      guild: { id: "guild123" },
    };
    const args = ["!clockwatch", "timer", "1", "min"];

    sendMessage.mockImplementationOnce(() => Promise.resolve());
    sendMessage.mockImplementationOnce(() => {
      throw new Error("Mocked error");
    });

    const result = await handleTimerCommand(message, args);

    expect(result).toBe(true);
    expect(sendMessage).toHaveBeenCalledWith(message, "Timer set for 1 min.");

    jest.advanceTimersByTime(60000);

    expect(sendMessage).toHaveBeenCalledWith(
      message,
      "<@12345> : 1 min have passed.",
    );
    expect(console.error).toHaveBeenCalledWith(
      "Error sending timer message:",
      expect.any(Error),
    );
    jest.useRealTimers();
  });

  it("should handle error when sending invalid duration message", async () => {
    const message = { channel: { send: jest.fn() }, guild: { id: "guild123" } };
    const args = ["!clockwatch", "timer", "-5", "min"];

    sendMessage.mockImplementationOnce(() => {
      throw new Error("Mocked error");
    });

    const result = await handleTimerCommand(message, args);

    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalledWith(
      "Error sending invalid duration message:",
      expect.any(Error),
    );
  });

  it("should handle error when sending duration too long message", async () => {
    const message = { channel: { send: jest.fn() }, guild: { id: "guild123" } };
    const args = ["!clockwatch", "timer", "25", "hours"];

    sendMessage.mockImplementationOnce(() => {
      throw new Error("Mocked error");
    });

    const result = await handleTimerCommand(message, args);

    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalledWith(
      "Error sending duration message:",
      expect.any(Error),
    );
  });

  it("should handle error when sending timer prompt message", async () => {
    const message = { channel: { send: jest.fn() }, guild: { id: "guild123" } };
    const args = ["!clockwatch", "timer"];

    sendMessage.mockImplementationOnce(() => {
      throw new Error("Mocked error");
    });

    const result = await handleTimerCommand(message, args);

    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalledWith(
      "Error sending timer prompt:",
      expect.any(Error),
    );
  });

  it("should handle error when sending initial timer message", async () => {
    const message = {
      channel: { send: jest.fn() },
      author: { id: "12345" },
      guild: { id: "guild123" },
    };
    const args = ["!clockwatch", "timer", "1", "min"];

    sendMessage.mockImplementationOnce(() => {
      throw new Error("Mocked error");
    });

    const result = await handleTimerCommand(message, args);

    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalledWith(
      "Error sending timer message:",
      expect.any(Error),
    );
  });

  it("should set a timer and notify when time is up", async () => {
    jest.useFakeTimers();
    const message = {
      channel: { send: jest.fn() },
      author: { id: "12345" },
      guild: { id: "guild123" },
    };
    const args = ["!clockwatch", "timer", "1", "min"];

    const result = await handleTimerCommand(message, args);

    expect(result).toBe(true);
    expect(sendMessage).toHaveBeenCalledWith(message, "Timer set for 1 min.");

    jest.advanceTimersByTime(60000);

    expect(sendMessage).toHaveBeenCalledWith(
      message,
      "<@12345> : 1 min have passed.",
    );
    jest.useRealTimers();
  });

  describe("handleTimerCommand with reset", () => {
    it("should not send a timer elapsed message if the timer is reset before it elapses", async () => {
      jest.useFakeTimers();
      const message = {
        channel: { send: jest.fn() },
        author: { id: "12345" },
        guild: { id: "guild123" },
      };
      const args = ["!clockwatch", "timer", "1", "min"];

      const result = await handleTimerCommand(message, args);

      expect(result).toBe(true);
      expect(sendMessage).toHaveBeenCalledWith(message, "Timer set for 1 min.");

      // Run the reset command before the timer elapses
      await handleResetCommand(message);

      // Advance the timers by 1 minute
      jest.advanceTimersByTime(60000);

      // Check that no timer elapsed message was sent
      expect(sendMessage).not.toHaveBeenCalledWith(
        message,
        "<@12345> : 1 min have passed.",
      );
      jest.useRealTimers();
    });
  });
});

describe("handleShowCommand", () => {
  beforeEach(() => {
    handleResetCommand({
      channel: { send: jest.fn() },
      guild: { id: "guild123" },
    });
    sendMessage.mockClear();
  });

  it("should respond with no active timers message when there are no timers", async () => {
    const message = { channel: { send: jest.fn() }, guild: { id: "guild123" } };

    const result = await handleShowCommand(message);

    expect(result).toBe(true);
    const calls = sendMessage.mock.calls.filter((call) => call[0] === message);
    expect(calls).toEqual([[message, "No active timers."]]);
  });

  it("should respond with active timers list when there are timers", async () => {
    const message = { channel: { send: jest.fn() }, guild: { id: "guild123" } };
    jest.useFakeTimers();
    // Make some timers
    const message1 = {
      channel: { send: jest.fn() },
      author: { username: "user1" },
      guild: { id: "guild123" },
    };
    const args1 = ["!clockwatch", "timer", "5", "min"];
    await handleTimerCommand(message1, args1);

    const message2 = {
      channel: { send: jest.fn() },
      author: { username: "user2" },
      guild: { id: "guild123" },
    };
    const args2 = ["!clockwatch", "timer", "1", "hour"];
    await handleTimerCommand(message2, args2);

    const result = await handleShowCommand(message);

    expect(result).toBe(true);
    const calls = sendMessage.mock.calls.filter((call) => call[0] === message);
    expect(calls).toEqual(
      expect.arrayContaining([
        [message, expect.stringContaining("Active timers:\nuser1: 5 min")],
        [message, expect.stringContaining("user2: 1 hour")],
      ]),
    );
  });

  it("should handle error when sending show command message", async () => {
    const message = { channel: { send: jest.fn() }, guild: { id: "guild123" } };

    sendMessage.mockImplementationOnce(() => {
      throw new Error("Mocked error");
    });

    const result = await handleShowCommand(message);

    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalledWith(
      "Error sending show command message:",
      expect.any(Error),
    );
  });
});

describe("handleResetCommand", () => {
  it("should reset all timers and send reset message", async () => {
    const message = { channel: { send: jest.fn() }, guild: { id: "guild123" } };

    // Make some timers
    const message1 = {
      channel: { send: jest.fn() },
      author: { id: "user1" },
      guild: { id: "guild123" },
    };
    const args1 = ["!clockwatch", "timer", "5", "min"];
    await handleTimerCommand(message1, args1);

    const message2 = {
      channel: { send: jest.fn() },
      author: { id: "user2" },
      guild: { id: "guild123" },
    };
    const args2 = ["!clockwatch", "timer", "1", "hour"];
    await handleTimerCommand(message2, args2);

    const result = await handleResetCommand(message);

    expect(result).toBe(true);
    expect(sendMessage).toHaveBeenCalledWith(message, "All timers reset.");
  });

  it("should handle error when sending reset message", async () => {
    const message = { channel: { send: jest.fn() }, guild: { id: "guild123" } };

    sendMessage.mockImplementationOnce(() => {
      throw new Error("Test error");
    });

    const result = await handleResetCommand(message);

    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalledWith(
      "Error sending reset command message:",
      expect.any(Error),
    );
  });
});

describe("handleSoonCommand", () => {
  it("should prompt for unit when args length is less than 3", async () => {
    const message = { channel: { send: jest.fn() }, guild: { id: "guild123" } };
    const args = ["!clockwatch", "soon"];

    const result = await handleSoonCommand(message, args);

    expect(result).toBe(true);
    expect(sendMessage).toHaveBeenCalledWith(
      message,
      "Please provide a unit (seconds for up to 15 minutes, minutes for up to 90 minutes, or hours for up to 6 hours).",
    );
  });

  it("should set a timer for a random duration in seconds", async () => {
    jest.useFakeTimers();
    const message = {
      channel: { send: jest.fn() },
      author: { id: "12345", username: "user1" },
      guild: { id: "guild1234" },
    };
    const args = ["!clockwatch", "soon", "seconds"];

    const result = await handleSoonCommand(message, args);

    expect(result).toBe(true);
    expect(sendMessage).toHaveBeenCalledWith(
      message,
      expect.stringContaining("Timer set for a random duration of"),
    );

    // Advance the timers by a random duration (simulate the timer elapsing)
    const timerDuration =
      sendMessage.mock.calls[0][1].match(/(\d+) seconds/)[1] * 1000;
    jest.advanceTimersByTime(timerDuration);

    // Check that the timer elapsed message was sent
    expect(sendMessage).toHaveBeenCalledWith(
      message,
      expect.stringContaining("<@12345> :"),
    );
    jest.useRealTimers();
  });

  it("should set a timer for a random duration in minutes", async () => {
    jest.useFakeTimers();
    const message = {
      channel: { send: jest.fn() },
      author: { id: "12345", username: "user1" },
      guild: { id: "guild123" },
    };
    const args = ["!clockwatch", "soon", "minutes"];

    const result = await handleSoonCommand(message, args);

    expect(result).toBe(true);
    expect(sendMessage).toHaveBeenCalledWith(
      message,
      expect.stringContaining("Timer set for a random duration of"),
    );

    // Advance the timers by a random duration (simulate the timer elapsing)
    const timerDuration =
      sendMessage.mock.calls[0][1].match(/(\d+) minutes/)[1] * 60 * 1000;
    jest.advanceTimersByTime(timerDuration);

    // Check that the timer elapsed message was sent
    expect(sendMessage).toHaveBeenCalledWith(
      message,
      expect.stringContaining("<@12345> :"),
    );
    jest.useRealTimers();
  });

  it("should set a timer for a random duration in hours", async () => {
    jest.useFakeTimers();
    const message = {
      channel: { send: jest.fn() },
      author: { id: "12345", username: "user1" },
      guild: { id: "guild123" },
    };
    const args = ["!clockwatch", "soon", "hours"];

    const result = await handleSoonCommand(message, args);

    expect(result).toBe(true);
    expect(sendMessage).toHaveBeenCalledWith(
      message,
      expect.stringContaining("Timer set for a random duration of"),
    );

    // Advance the timers by a random duration (simulate the timer elapsing)
    const timerDuration =
      sendMessage.mock.calls[0][1].match(/(\d+) hours/)[1] * 60 * 60 * 1000;
    jest.advanceTimersByTime(timerDuration);

    // Check that the timer elapsed message was sent
    expect(sendMessage).toHaveBeenCalledWith(
      message,
      expect.stringContaining("<@12345> :"),
    );
    jest.useRealTimers();
  });

  it("should handle invalid unit", async () => {
    const message = { channel: { send: jest.fn() }, guild: { id: "guild123" } };
    const args = ["!clockwatch", "soon", "invalidUnit"];

    const result = await handleSoonCommand(message, args);

    expect(result).toBe(true);
    expect(sendMessage).toHaveBeenCalledWith(
      message,
      "Invalid unit. Please use seconds, minutes, or hours.",
    );
  });

  it("should handle error when sending unit prompt", async () => {
    const message = { channel: { send: jest.fn() }, guild: { id: "guild123" } };
    const args = ["!clockwatch", "soon"];

    sendMessage.mockImplementationOnce(() => {
      throw new Error("Mocked error");
    });

    const result = await handleSoonCommand(message, args);

    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalledWith(
      "Error sending unit prompt:",
      expect.any(Error),
    );
  });

  it("should handle error when sending invalid unit message", async () => {
    const message = { channel: { send: jest.fn() }, guild: { id: "guild123" } };
    const args = ["!clockwatch", "soon", "invalidUnit"];

    sendMessage.mockImplementationOnce(() => {
      throw new Error("Mocked error");
    });

    const result = await handleSoonCommand(message, args);

    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalledWith(
      "Error sending invalid unit message:",
      expect.any(Error),
    );
  });

  it("should handle error when sending timer message", async () => {
    const message = {
      channel: { send: jest.fn() },
      author: { id: "12345", username: "user1" },
      guild: { id: "guild123" },
    };
    const args = ["!clockwatch", "soon", "minutes"];

    sendMessage.mockImplementationOnce(() => {
      throw new Error("Mocked error");
    });

    const result = await handleSoonCommand(message, args);

    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalledWith(
      "Error sending timer message:",
      expect.any(Error),
    );
  });

  it("should handle error when sending timer elapsed message", async () => {
    jest.useFakeTimers();
    const message = {
      channel: { send: jest.fn() },
      author: { id: "12345", username: "user1" },
      guild: { id: "guild123" },
    };
    const args = ["!clockwatch", "soon", "minutes"];

    const result = await handleSoonCommand(message, args);

    expect(result).toBe(true);
    expect(sendMessage).toHaveBeenCalledWith(
      message,
      expect.stringContaining("Timer set for a random duration of"),
    );

    // Mock error when sending the timer elapsed message
    sendMessage.mockImplementationOnce(() => {
      throw new Error("Mocked error");
    });

    // Advance the timers by a random duration (simulate the timer elapsing)
    const timerDuration =
      sendMessage.mock.calls[0][1].match(/(\d+) minutes/)[1] * 60 * 1000;
    jest.advanceTimersByTime(timerDuration);

    // Check that the error was logged
    expect(console.error).toHaveBeenCalledWith(
      "Error sending timer message:",
      expect.any(Error),
    );
    jest.useRealTimers();
  });

  it("should not send a timer elapsed message if the timer is reset before it elapses", async () => {
    jest.useFakeTimers();
    const message = {
      channel: { send: jest.fn() },
      author: { id: "12345", username: "user1" },
      guild: { id: "guild123" },
    };
    const args = ["!clockwatch", "soon", "minutes"];

    const result = await handleSoonCommand(message, args);

    expect(result).toBe(true);
    expect(sendMessage).toHaveBeenCalledWith(
      message,
      expect.stringContaining("Timer set for a random duration of"),
    );

    // Run the reset command before the timer elapses
    await handleResetCommand(message);

    // Advance the timers by a random duration (simulate the timer elapsing)
    const timerDuration =
      sendMessage.mock.calls[0][1].match(/(\d+) minutes/)[1] * 60 * 1000;
    jest.advanceTimersByTime(timerDuration);

    // Check that no timer elapsed message was sent
    expect(sendMessage).not.toHaveBeenCalledWith(
      message,
      expect.stringContaining("<@12345> :"),
    );
    jest.useRealTimers();
  });

  it("should set a timer for a random duration in sec", async () => {
    jest.useFakeTimers();
    const message = {
      channel: { send: jest.fn() },
      author: { id: "12345", username: "user1" },
      guild: { id: "guild123" },
    };
    const args = ["!clockwatch", "soon", "sec"];

    const result = await handleSoonCommand(message, args);

    expect(result).toBe(true);
    expect(sendMessage).toHaveBeenCalledWith(
      message,
      expect.stringContaining("Timer set for a random duration of"),
    );

    // Advance the timers by a random duration (simulate the timer elapsing)
    const timerDuration =
      sendMessage.mock.calls[0][1].match(/(\d+) seconds/)[1] * 1000;
    jest.advanceTimersByTime(timerDuration);

    // Check that the timer elapsed message was sent
    expect(sendMessage).toHaveBeenCalledWith(
      message,
      expect.stringContaining("<@12345> :"),
    );
    jest.useRealTimers();
  });

  it("should set a timer for a random duration in second", async () => {
    jest.useFakeTimers();
    const message = {
      channel: { send: jest.fn() },
      author: { id: "12345", username: "user1" },
      guild: { id: "guild123" },
    };
    const args = ["!clockwatch", "soon", "second"];

    const result = await handleSoonCommand(message, args);

    expect(result).toBe(true);
    expect(sendMessage).toHaveBeenCalledWith(
      message,
      expect.stringContaining("Timer set for a random duration of"),
    );

    // Advance the timers by a random duration (simulate the timer elapsing)
    const timerDuration =
      sendMessage.mock.calls[0][1].match(/(\d+) seconds/)[1] * 1000;
    jest.advanceTimersByTime(timerDuration);

    // Check that the timer elapsed message was sent
    expect(sendMessage).toHaveBeenCalledWith(
      message,
      expect.stringContaining("<@12345> :"),
    );
    jest.useRealTimers();
  });

  it("should set a timer for a random duration in min", async () => {
    jest.useFakeTimers();
    const message = {
      channel: { send: jest.fn() },
      author: { id: "12345", username: "user1" },
      guild: { id: "guild123" },
    };
    const args = ["!clockwatch", "soon", "min"];

    const result = await handleSoonCommand(message, args);

    expect(result).toBe(true);
    expect(sendMessage).toHaveBeenCalledWith(
      message,
      expect.stringContaining("Timer set for a random duration of"),
    );

    // Advance the timers by a random duration (simulate the timer elapsing)
    const timerDuration =
      sendMessage.mock.calls[0][1].match(/(\d+) minutes/)[1] * 60 * 1000;
    jest.advanceTimersByTime(timerDuration);

    // Check that the timer elapsed message was sent
    expect(sendMessage).toHaveBeenCalledWith(
      message,
      expect.stringContaining("<@12345> :"),
    );
    jest.useRealTimers();
  });

  it("should set a timer for a random duration in minute", async () => {
    jest.useFakeTimers();
    const message = {
      channel: { send: jest.fn() },
      author: { id: "12345", username: "user1" },
      guild: { id: "guild123" },
    };
    const args = ["!clockwatch", "soon", "minute"];

    const result = await handleSoonCommand(message, args);

    expect(result).toBe(true);
    expect(sendMessage).toHaveBeenCalledWith(
      message,
      expect.stringContaining("Timer set for a random duration of"),
    );

    // Advance the timers by a random duration (simulate the timer elapsing)
    const timerDuration =
      sendMessage.mock.calls[0][1].match(/(\d+) minutes/)[1] * 60 * 1000;
    jest.advanceTimersByTime(timerDuration);

    // Check that the timer elapsed message was sent
    expect(sendMessage).toHaveBeenCalledWith(
      message,
      expect.stringContaining("<@12345> :"),
    );
    jest.useRealTimers();
  });

  it("should set a timer for a random duration in hour", async () => {
    jest.useFakeTimers();
    const message = {
      channel: { send: jest.fn() },
      author: { id: "12345", username: "user1" },
      guild: { id: "guild123" },
    };
    const args = ["!clockwatch", "soon", "hour"];

    const result = await handleSoonCommand(message, args);

    expect(result).toBe(true);
    expect(sendMessage).toHaveBeenCalledWith(
      message,
      expect.stringContaining("Timer set for a random duration of"),
    );

    // Advance the timers by a random duration (simulate the timer elapsing)
    const timerDuration =
      sendMessage.mock.calls[0][1].match(/(\d+) hours/)[1] * 60 * 60 * 1000;
    jest.advanceTimersByTime(timerDuration);

    // Check that the timer elapsed message was sent
    expect(sendMessage).toHaveBeenCalledWith(
      message,
      expect.stringContaining("<@12345> :"),
    );
    jest.useRealTimers();
  });

  it("should set a timer for a random duration in hours", async () => {
    jest.useFakeTimers();
    const message = {
      channel: { send: jest.fn() },
      author: { id: "12345", username: "user1" },
      guild: { id: "guild123" },
    };
    const args = ["!clockwatch", "soon", "hours"];

    const result = await handleSoonCommand(message, args);

    expect(result).toBe(true);
    expect(sendMessage).toHaveBeenCalledWith(
      message,
      expect.stringContaining("Timer set for a random duration of"),
    );

    // Advance the timers by a random duration (simulate the timer elapsing)
    const timerDuration =
      sendMessage.mock.calls[0][1].match(/(\d+) hours/)[1] * 60 * 60 * 1000;
    jest.advanceTimersByTime(timerDuration);

    // Check that the timer elapsed message was sent
    expect(sendMessage).toHaveBeenCalledWith(
      message,
      expect.stringContaining("<@12345> :"),
    );
    jest.useRealTimers();
  });
});
