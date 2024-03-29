import { Client, Intents, Message, VoiceState } from 'discord.js';
import { BotCfg, cfg } from './cfg/cfg';
import { CommandHandler } from './command_handler';
import { disconnect } from './music/music_controller'

function validateConfig(botcfg: BotCfg) {
    if (!botcfg.token) {
        throw new Error('You need to specify the token!');
    }
}
// https://github.com/discordjs/voice/blob/main/examples/music-bot/src/bot.ts

validateConfig(cfg);

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] });

client.on('ready', () => {
    console.log(`I\'m alive! ${client.user?.tag}`);
    client.user?.setActivity('with your auditive feelings...', { type: 'PLAYING' });
});

const commandHandler = new CommandHandler(cfg.prefix);

client.on('messageCreate', (message: Message) => {
    commandHandler.handleMessage(message);
});

client.on('voiceStateUpdate', (oldstate, newState) => {
    if (oldstate.channel?.members.size === 1) {
        disconnect(oldstate.guild.id);
    }
});

client.on('error', (e) => {
    console.error('Discord client error!', e);
});

client.login(cfg.token);