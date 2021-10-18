module.exports = {
    name: 'stop',
    description: 'stops the music and leaves the channel',
    async execute(message, args){
        const voiceChannel = message.member.voice.channel; 
        if(!voiceChannel) return message.channel.send(`You need to be in a channel to use this command ${message.author}`)
        await voiceChannel.leave();
        await message.channel.send('Stopping :call_me:');
    }
}