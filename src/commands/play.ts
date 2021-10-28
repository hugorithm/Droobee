import { CommandContext } from '../models/command_context';
import { Command } from './command';
import { Snowflake, VoiceChannel } from 'discord.js';
import { MusicSubscription } from '../music/subscription';
import { connectToChannel, playSong } from '../music/music_controller';
import {search} from 'yt-search';

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
        let arg = args[0];
        if (!arg.match(regex)) {
            const res = await search(args.join(" ")); 
            const url = res.videos[0].url; 
            arg = url;  
        } 

        try {
            const connection = await connectToChannel(voiceChannel as VoiceChannel);
            await playSong(parsedUserCommand, arg);
        } catch (err) {
            console.log(err);
        }

        


    }

    hasPermissionToRun(parsedUserCommand: CommandContext): boolean {
        return true;
    }

}
