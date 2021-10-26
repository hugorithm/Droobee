import { CommandContext } from '../models/command_context';
import { Command } from './command';
import { skip } from '../music/subscription_controller';


export class Skip implements Command {

    commandNames = ['skip', 's'];

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

        skip(voiceChannel.guildId);

    }

    
    hasPermissionToRun(parsedUserCommand: CommandContext): boolean {
        return true;
    }
}