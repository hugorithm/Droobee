import { CommandContext } from '../models/command_context';
import { Command } from './command';

export class Greet implements Command {
    commandNames = ['greet', 'hello'];

    getHelpMessage(commandPrefix: string): string {
        return `Use ${commandPrefix}greet to get a greeting.`;
    }

    async run(parsedUserCommand: CommandContext): Promise<void> {
        await parsedUserCommand.originalMessage.reply('hello, world! 👋🌎');
    }

    hasPermissionToRun(parsedUserCommand: CommandContext): boolean {
        return true;
    }
}