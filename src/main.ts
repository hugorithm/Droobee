import { Client, Intents, Message } from 'discord.js';
import { BotCfg, cfg } from './cfg/cfg';
import {CommandHandler} from './command_handler';

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
    commandHandler.handleMessage(message);
});

client.on('error', (e) => {
    console.error('Discord client error!', e);
});

client.login(cfg.token);