import fs from 'fs';

export type BotCfg = {
    token: string;
    prefix: string;
    botOwnerRole: string;
    enableReactions: boolean;
}

export const cfg: BotCfg = {
    token: loadToken(),
    prefix: '|',
    botOwnerRole: 'someRole',
    enableReactions: false
};

function loadToken(): string{
    try{
        return fs.readFileSync('token').toString().trim();
    }catch{
        if(process.env.TOKEN){
            return process.env.TOKEN;
        } else {
            throw new Error("Token not found!");
        }
    }
}