import { CommandContext } from '../models/command_context';
import { Command } from './command';
import ytSearch from 'yt-search';
import { raw as ytdl } from 'youtube-dl-exec';
import { 
        AudioPlayerStatus, 
        AudioResource, 
        createAudioPlayer,
        createAudioResource,
        demuxProbe,
        DiscordGatewayAdapterCreator,
        DiscordGatewayAdapterLibraryMethods,
        entersState,
        joinVoiceChannel,
        StreamType, 
        VoiceConnectionStatus
} from '@discordjs/voice'; 
import { Message, Snowflake, StageChannel, VoiceChannel } from 'discord.js';
import {createDiscordJSAdapter} from '../adapters/adapter';
 
export class Play implements Command {
    commandNames = ['play', 'p'];

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
            await parsedUserCommand.originalMessage.channel.send(`You need to be in a channel to use this command ${parsedUserCommand.originalMessage.author}`);
            return;
        }
       
        const args = parsedUserCommand.args;
        if(!args.length){
            await parsedUserCommand.originalMessage.channel.send(`Syntax: !play <link or search query> ${parsedUserCommand.originalMessage.author}`);
            return;
        } 


        const player = createAudioPlayer();
        try {
            const test = await playSong();
    
            console.log('Song is ready to play!');
        } catch (error) {
            console.error(error);
        }

        try{
           
            const connection = await connectToChannel(voiceChannel as VoiceChannel);
            const test2 = connection.subscribe(player);
            await parsedUserCommand.originalMessage.reply('Playing now!');

        } catch(err){
            console.log(err);
        }


        async function playSong() {
            const resource = createAudioResource('https://www.youtube.com/watch?v=IL0dxX_z2qc', {
                inputType: StreamType.Arbitrary,
            });
            player.play(resource);
            return await entersState(player, AudioPlayerStatus.Playing, 5e3);
        }

        async function connectToChannel(channel: VoiceChannel) {
            const connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: createDiscordJSAdapter(channel),
            });

         
            try {
                await entersState(connection, VoiceConnectionStatus.Ready, 30e3);
                return connection;
            } catch (error) {
               
                connection.destroy();
                throw error;
            }
        }

        // function createYtdlResource(url: string): Promise<AudioResource<Track>> {
        //     return new Promise((resolve, reject) => {
        //         const process = ytdl(
        //             url,
        //             {
        //                 o: '-',
        //                 q: '',
        //                 f: 'bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio',
        //                 r: '100K',
        //             },
        //             { stdio: ['ignore', 'pipe', 'ignore'] },
        //         );
        //         if (!process.stdout) {
        //             reject(new Error('No stdout'));
        //             return;
        //         }
        //         const stream = process.stdout;
        //         const onError = (error: Error) => {
        //             if (!process.killed) process.kill();
        //             stream.resume();
        //             reject(error);
        //         };
        //         process
        //             .once('spawn', () => {
        //                 demuxProbe(stream)
        //                     .then((probe) => resolve(createAudioResource(probe.stream, { metadata: this, inputType: probe.type })))
        //                     .catch(onError);
        //             })
        //             .catch(onError);
        //     });
        // }
    }
    
    hasPermissionToRun(parsedUserCommand: CommandContext): boolean {
        return true;
    }

}
