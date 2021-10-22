import { CommandContext } from '../models/command_context';
import { Command } from './command';

export class Ping implements Command {
    commandNames = ['ping'];

    getHelpMessage(commandPrefix: string): string {
        return `Use ${commandPrefix}ping to ping me.`;
    }

    async run(parsedUserCommand: CommandContext): Promise<void> {
        await parsedUserCommand.originalMessage.reply('Pong! 🏓');
    }

    hasPermissionToRun(parsedUserCommand: CommandContext): boolean {
        return true;
    }
}