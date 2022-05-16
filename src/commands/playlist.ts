import { CommandContext } from '../models/command_context';
import { Command } from './command';
import { getCurrentSong, getQueue, getQueueDuration } from '../music/music_controller';
import { MessageEmbed } from 'discord.js';


export class Playlist implements Command {

    commandNames = ['playlist', 'pl', 'queue', 'q'];

    getHelpMessage(commandPrefix: string): string {
        return `Use ${commandPrefix}skip to skip the current song!`;
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
        if (args.length !== 0) {
            await parsedUserCommand.originalMessage.channel.send(`Syntax: !skip ${parsedUserCommand.originalMessage.author}`);
            return;
        }

        const tracks = getQueue(voiceChannel.guildId);
        
        const stitle = tracks.reduce((acc, t) => `${acc}${t.id + 1}. ${t.title} \n ${t.url} \n`, "");

        if (!(tracks.length > 0)) return;

        const queueDuration = getQueueDuration(voiceChannel.guildId);

        let embed = new MessageEmbed();
        embed.setTitle('**Queue:**')
            .setDescription(`${stitle}`)
            .setThumbnail('https://cdn.discordapp.com/attachments/143882671179825153/975540913583583242/unknown.png')
            .setFooter({text: `Duration: ${queueDuration}`});
            
        await parsedUserCommand.originalMessage.channel.send({embeds: [embed]});
    }

    hasPermissionToRun(parsedUserCommand: CommandContext): boolean {
        return true;
    }
}