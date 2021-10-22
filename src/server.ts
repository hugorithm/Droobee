import { Client, Intents, DiscordAPIError, Message, Collection } from 'discord.js';
import { BotCfg, cfg } from './cfg/cfg';
import {CommandHandler} from './command_handler';

// https://github.com/discordjs/voice
// https://github.com/discordjs/voice/tree/main/examples
// https://discordjs.github.io/voice/modules.html#joinvoicechannel
// https://discordjs.github.io/voice/interfaces/joinvoicechanneloptions.html
// https://discordjs.github.io/voice/interfaces/createvoiceconnectionoptions.html
// https://discordjs.github.io/voice/modules.html#discordgatewayadaptercreator

function validateConfig(botcfg: BotCfg) {
    if (!botcfg.token) {
        throw new Error('You need to specify the token!');
    }
}

validateConfig(cfg);

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] });


client.on('ready', () => {
    console.log(`I\'m alive! ${client.user?.tag}`);
});

const commandHandler = new CommandHandler(cfg.prefix);

client.on('messageCreate', (message: Message) => {
    console.log(message);
    commandHandler.handleMessage(message);
});

client.on('error', (e) => {
    console.error('Discord client error!', e);
});

client.login(cfg.token);