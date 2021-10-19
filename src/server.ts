const  { Client, Intents, DiscordAPIError, Collection } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const fs = require('fs');


client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands/').filter(x => x.endsWith('.js'))
commandFiles.forEach(file => {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
});

const prefix = '!';

client.on('messageCreate', async message => {
    if(!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLocaleLowerCase();

    client.commands.get(command).execute(message, args);
   
    
    
});



client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

const token = fs.readFileSync('token');
client.login(token);