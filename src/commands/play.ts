import { CommandContext } from '../models/command_context';
import { Command } from './command';
import ytdl from 'ytdl-core';
import ytSearch  from 'yt-search';

 

// module.exports = {
//     name: 'play',
//     description: 'Joins channel and plays music',
//     async execute(message, args){
//         const voiceChannel = message.member.voice.channel; 
//         if(!voiceChannel) return message.channel.send(`You need to be in a channel to use this command ${message.author}`)
//         const permissions = voiceChannel.permissionsFor(message.client.user);
//         if(!permissions.has('CONNECT')) return message.channel.send(`You don't have connect permissions ${message.author}`);
//         if(!permissions.has('SPEAK')) return message.channel.send(`You don't have speak permissions ${message.author}`);
//         if(!args.length) return message.channel.send(`Syntax: !play <link or search query> ${message.author}`);

//         const connection = await voiceChannel.join();
//         const fVideo = async (query) => {
//             const res = await ytSearch(query);
//             return (res.videos.length >= 1) ? res.videos[0] : null;
//         }

//         const video = await fVideo(args.join(' '));
//         if(video){
//             const stream = ytdl(video.url, {filter: 'audioonly'});
//             connection.play(stream, {seek: 0, volume: 1}).on('finish', () => {
//                 voiceChannel.leave();
//             });
//             await message.reply(`Now Playing ***${video.title}***`);

//         } else{
//             message.channel.send('No results were found!');
//         }
//     }
// }


export class PlayCommand implements Command {
    commandNames = ['play'];

    getHelpMessage(commandPrefix: string): string {
        return `Use ${commandPrefix}play to play a song!.`;
    }

    async run(parsedUserCommand: CommandContext): Promise<void> {
        const voiceChannel = parsedUserCommand.originalMessage.member?.voice.channel;
        // if(!voiceChannel) parsedUserCommand.originalMessage.channel.send(`You need to be in a channel to use this command ${parsedUserCommand.originalMessage.author}`)
        // const permissions =  voiceChannel.permissionsFor(parsedUserCommand.client.user);
        // if(!permissions.has('CONNECT')) message.channel.send(`You don't have connect permissions ${message.author}`);
        // if(!permissions.has('SPEAK')) message.channel.send(`You don't have speak permissions ${message.author}`);
        // if(!parsedUserCommand.args.length) message.channel.send(`Syntax: !play <link or search query> ${message.author}`);
        // const args = await parsedUserCommand.args;
        
    }

    hasPermissionToRun(parsedUserCommand: CommandContext): boolean {
        return true;
    }
}