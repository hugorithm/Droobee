"use strict";
module.exports = {
    name: 'ping',
    description: 'it pings',
    execute(message, args) {
        message.channel.send(`I'm alive ${message.author}`);
    }
};
