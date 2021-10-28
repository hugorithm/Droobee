import { CommandContext } from '../models/command_context';
import { Command } from './command';
import { unpause } from '../music/music_controller';


export class Unpause implements Command {

    commandNames = ['unpause', 'resume'];

    getHelpMessage(commandPrefix: string): string {
        return `Use ${commandPrefix}unpause to unpause the current song!`;
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
            await parsedUserCommand.originalMessage.channel.send(`Syntax: !unpause ${parsedUserCommand.originalMessage.author}`);
            return;
        }

        unpause(voiceChannel.guildId);

    }

    
    hasPermissionToRun(parsedUserCommand: CommandContext): boolean {
        return true;
    }
}