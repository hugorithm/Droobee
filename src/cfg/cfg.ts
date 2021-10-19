import fs from 'fs';

export type BotCfg = {
    token: string;
    prefix: string;
    botOwnerRole: string;
    enableReactions: boolean;
}

export const cfg: BotCfg = {
    token: fs.readFileSync('../../token').toString(),
    prefix: '!',
    botOwnerRole: 'someRole',
    enableReactions: true
};