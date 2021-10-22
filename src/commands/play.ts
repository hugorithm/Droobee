import { CommandContext } from '../models/command_context';
import { Command } from './command';
import ytdl from 'ytdl-core';
import ytSearch from 'yt-search';
import { 
        AudioPlayerStatus, 
        createAudioPlayer,
        createAudioResource,
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

        try {
            await playSong();
            console.log('Song is ready to play!');
        } catch (error) {
            /*
                The song isn't ready to play for some reason :(
            */
            console.error(error);
        }


        const player = createAudioPlayer();
        await playSong();
        function playSong() {
            
            const resource = createAudioResource('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', {
                inputType: StreamType.Arbitrary,
            });

            player.play(resource);
           
            return entersState(player, AudioPlayerStatus.Playing, 5e3);
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


        try{
            const connection = await connectToChannel(voiceChannel as VoiceChannel);
            connection.subscribe(player);
            await parsedUserCommand.originalMessage.reply('Playing now!')

        } catch(err){
            console.log(err);
        }

    }

    hasPermissionToRun(parsedUserCommand: CommandContext): boolean {
        return true;
    }

}
