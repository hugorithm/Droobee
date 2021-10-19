import { Client, Intents, DiscordAPIError, Message, Collection } from 'discord.js';
import { BotCfg, cfg } from './cfg/cfg';
import  * as cmdHandler from './command_handler';



function validateConfig(botcfg: BotCfg) {
    if (!botcfg.token) {
        throw new Error('You need to specify the token!');
    }
}

validateConfig(cfg);

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });


client.on('ready', () => {
    console.log(`I\'m alive! ${client.user?.tag}`);
});

const commandHandler = new cmdHandler.CommandHandler(cfg.prefix);

client.on('messageCreated', (message: Message) => {
    commandHandler.handleMessage(message);
});

client.on('error', (e) => {
    console.error('Discord client error!', e);
});

client.login(cfg.token);