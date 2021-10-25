import { Message } from 'discord.js';
import { Command } from './commands/command';
import { Ping } from './commands/ping';
import { Greet } from './commands/greet';
import { Play } from './commands/play';
import { Stop } from './commands/stop';
import { Skip } from './commands/skip';
import { HelpCommand } from './commands/help';
import { CommandContext } from './models/command_context';
import { reactor } from './reactions/reactor';

export class CommandHandler {
    private commands: Command[];

    constructor(private readonly prefix: string) {
        const commandClasses = [
            Ping,
            Greet,
            Play,
            Skip,
            Stop
        ];

        this.commands = commandClasses.map((CommandClass) => new CommandClass());
        this.commands.push(new HelpCommand(this.commands));
    }

    /** Executes user commands contained in a message if appropriate. */
    async handleMessage(message: Message): Promise<void> {
        if (message.author.bot || !this.isCommand(message)) {
            return;
        }

        const commandContext = new CommandContext(message, this.prefix);

        const allowedCommands = this.commands.filter((command) =>
            command.hasPermissionToRun(commandContext),
        );
        const matchedCommand = this.commands.find((command) =>
            command.commandNames.includes(commandContext.parsedCommandName),
        );

        if (!matchedCommand) {
            await message.reply("I don't recognize that command. Try !help.");
            await reactor.failure(message);
        } else if (!allowedCommands.includes(matchedCommand)) {
            await message.reply("you aren't allowed to use that command. Try !help.");
            await reactor.failure(message);
        } else {
            await matchedCommand
                .run(commandContext)
                .then(() => {
                    reactor.success(message);
                })
                .catch((reason) => {
                    reactor.failure(message);
                });
        }
    }

    /** Determines whether or not a message is a user command. */
    private isCommand(message: Message): boolean {
        return message.content.startsWith(this.prefix);
    }
}