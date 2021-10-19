import { CommandContext } from '../models/command_context';

export interface Command {
    
    readonly commandNames: string[];
 
    getHelpMessage(commandPrefix: string): string;

    run(parsedUserCommand: CommandContext): Promise<void>;

    hasPermissionToRun(parsedUserCommand: CommandContext): boolean;
}