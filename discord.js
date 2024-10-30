async function sendMessage(message, content) {
    message.channel.send(content)
        .then(() => console.log('Message sent'))
        .catch(console.error);
}

module.exports = { sendMessage };