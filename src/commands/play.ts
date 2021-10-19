import { CommandContext } from '../models/command_context';
import { Command } from './command';
import ytdl from 'ytdl-core';
import ytSearch from 'yt-search';
import { createAudioPlayer, DiscordGatewayAdapterCreator, DiscordGatewayAdapterLibraryMethods, joinVoiceChannel } from '@discordjs/voice'; 
import { Snowflake, StageChannel, VoiceChannel } from 'discord.js';
import {createDiscordJSAdapter} from '../adapters/adapter';
 
export class PlayCommand implements Command {
    commandNames = ['play'];

    getHelpMessage(commandPrefix: string): string {
        return `Use ${commandPrefix}play to play a song!.`;
    }

    async run(parsedUserCommand: CommandContext): Promise<void> {
        const member = parsedUserCommand.originalMessage.member;
        if(!member) {
            await parsedUserCommand.originalMessage.channel.send(`This command doesn't work in DM's`);
            return;
        }
        const voiceChannel = member.voice?.channel;
        if(!voiceChannel) {
            parsedUserCommand.originalMessage.channel.send(`You need to be in a channel to use this command ${parsedUserCommand.originalMessage.author}`);
            return;
        }
       
        const args = parsedUserCommand.args;
        if(!args.length){
            parsedUserCommand.originalMessage.channel.send(`Syntax: !play <link or search query> ${parsedUserCommand.originalMessage.author}`);
            return;
        } 

        if(voiceChannel.type == "GUILD_STAGE_VOICE") return;
        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: createDiscordJSAdapter(voiceChannel),
        });
        

        const player = createAudioPlayer();

        
        const fVideo = async (query: string) => {
            const res = await ytSearch(query);
            return (res.videos.length >= 1) ? res.videos[0] : null;
        }

        const video = await fVideo(args.join(' '));
        // if(video){
        //     const stream = ytdl(video.url, {filter: 'audioonly'});
        //     connection.play(stream, {seek: 0, volume: 1}).on('finish', () => {
        //         voiceChannel!.leave();
        //     });
        //     await parsedUserCommand.originalMessage.reply(`Now Playing ***${video.title}***`);

        // } else{
        //     parsedUserCommand.originalMessage.channel.send('No results were found!');
        // }

    }

    hasPermissionToRun(parsedUserCommand: CommandContext): boolean {
        return true;
    }

}
