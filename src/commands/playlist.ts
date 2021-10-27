import { CommandContext } from '../models/command_context';
import { Command } from './command';
import { getQueue } from '../music/music_controller';


export class Playlist implements Command {

    commandNames = ['playlist', 'pl', 'queue'];

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

        const pl = getQueue(voiceChannel.guildId);
        let stitle = "";
        pl.forEach(x => {
            stitle = stitle.concat(x.title, " | ".concat(x.url) , "\n");
        });
        if(!(pl.length > 0)) return;
        await parsedUserCommand.originalMessage.channel.send(`\`\`\`${stitle}\`\`\``);


    }

    
    hasPermissionToRun(parsedUserCommand: CommandContext): boolean {
        return true;
    }
}