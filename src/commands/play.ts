import { CommandContext } from '../models/command_context';
import { Command } from './command';
import {
    entersState,
    joinVoiceChannel,
    VoiceConnectionStatus
} from '@discordjs/voice';
import { Snowflake, VoiceChannel } from 'discord.js';
import { createDiscordJSAdapter } from '../adapters/adapter';
import { Track } from '../music/track.js';
import { MusicSubscription } from '../music/subscription';
import { enqueue, subscribe } from '../music/subscription_controller';

const subscriptions = new Map<Snowflake, MusicSubscription>();

export class Play implements Command {

    commandNames = ['play', 'p'];

    getHelpMessage(commandPrefix: string): string {
        return `Use ${commandPrefix}play to play a song!`;
    }

    async run(parsedUserCommand: CommandContext): Promise<void> {
        const member = parsedUserCommand.originalMessage.member;                //Check if it is DM
        if (!member) {
            await parsedUserCommand.originalMessage.channel.send(`This command doesn't work in DM's`);
            return;
        }

        const voiceChannel = member.voice?.channel;                             //Check if user is in voice channel
        if (!voiceChannel) {
            await parsedUserCommand.originalMessage.channel.send(`You need to be in a channel to use this command ${parsedUserCommand.originalMessage.author}`);
            return;
        }

        const args = parsedUserCommand.args;                                    //Check for null arguments
        if (!args.length) {
            await parsedUserCommand.originalMessage.channel.send(`Syntax: !play <link or search query> ${parsedUserCommand.originalMessage.author}`);
            return;
        }

        const expr = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
        const regex = new RegExp(expr);
        if (!args[0].match(regex)) {
            await parsedUserCommand.originalMessage.reply('You must provide a link until I figure my shit');
            return;
        }

        try {
            const connection = await connectToChannel(voiceChannel as VoiceChannel);
            await playSong();
        } catch (err) {
            console.log(err);
        }

        async function playSong() {
            const track = await Track.from(args[0], {
                async onStart() {
                    await parsedUserCommand.originalMessage.reply(`Now Playing: **${track.title}**`);
                },
                async onFinish() {
                    await parsedUserCommand.originalMessage.channel.send(`Finished playing: **${track.title}**`);
                },
                async onError(error) {
                    console.warn(error);
                    await parsedUserCommand.originalMessage.channel.send('There was an unespected error!');
                },
            });

            enqueue(parsedUserCommand.originalMessage.guildId!, track);
            await parsedUserCommand.originalMessage.channel.send(`**${track.title}** was added to the queue!`);
        }

        async function connectToChannel(channel: VoiceChannel) {
            const connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guildId,
                adapterCreator: createDiscordJSAdapter(channel),
            });
            
            subscribe(connection, channel.guildId);

            try {
                await entersState(connection, VoiceConnectionStatus.Ready, 30e3);
                return connection;
            } catch (error) {
                connection.destroy();
                throw error;
            }
        }

    }

    hasPermissionToRun(parsedUserCommand: CommandContext): boolean {
        return true;
    }

}
