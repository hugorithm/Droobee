import { CommandContext } from '../models/command_context';
import { Command } from './command';

export class HelpCommand implements Command {
    readonly commandNames = ['help', 'halp', 'hlep', 'hllp', 'elpe'];

    private commands: Command[];

    constructor(commands: Command[]) {
        this.commands = commands;
    }

    async run(commandContext: CommandContext): Promise<void> {
        const allowedCommands = this.commands.filter((command) =>
            command.hasPermissionToRun(commandContext),
        );

        if (commandContext.args.length === 0) {
            const commandNames = allowedCommands.map(
                (command) => command.commandNames[0],
            );
            await commandContext.originalMessage.reply(
                `here is a list of commands you can run: \`\`\`${commandNames.join('\n -')}\`\`\`. Try !help ${commandNames[0]} to learn more about one of them.`
            );
            return;
        }

        const matchedCommand = this.commands.find((command) =>
            command.commandNames.includes(commandContext.args[0]),
        );
        if (!matchedCommand) {
            await commandContext.originalMessage.reply(
                "I don't recognise this command 😭. Try !help to find all commands you can use.",
            );
            throw Error('Unrecognized command');
        }
        if (allowedCommands.includes(matchedCommand)) {
            await commandContext.originalMessage.reply(
                this.buildHelpMessageForCommand(matchedCommand, commandContext),
            );
        }
    }

    private buildHelpMessageForCommand(
        command: Command,
        context: CommandContext,
    ): string {
        return `${command.getHelpMessage(
            context.commandPrefix,
        )}\nCommand aliases: ${command.commandNames.join(', ')}`;
    }

    hasPermissionToRun(commandContext: CommandContext): boolean {
        return true;
    }

    getHelpMessage(commandPrefix: string) {
        return 'I think you already know how to use this command...';
    }
}
