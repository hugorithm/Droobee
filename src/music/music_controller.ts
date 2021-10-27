import { entersState, joinVoiceChannel, VoiceConnection, VoiceConnectionStatus } from "@discordjs/voice";
import { Snowflake, VoiceChannel } from "discord.js";
import { createDiscordJSAdapter } from "../adapters/adapter";
import { CommandContext } from "../models/command_context";
import { MusicSubscription } from "./subscription";
import { Track } from "./track";

const subscriptions = new Map<Snowflake, MusicSubscription>();
const connections = new Map<Snowflake, VoiceConnection>();

export function enqueue(sn: Snowflake, track: Track): void {
    const sub = subscriptions.get(sn);
    if (!sub) {
        throw new Error("There should be a subscription here!");
    } else {
        sub.enqueue(track);
    }
}

export function subscribe(connection: VoiceConnection, guildId: Snowflake): void {
    const sub = subscriptions.get(guildId);
    if (!sub) {
        const subscription = new MusicSubscription(connection);
        subscriptions.set(guildId, subscription);
    }
}

export function skip(sn: Snowflake): void {
    const sub = subscriptions.get(sn);
    if (!sub) {
        throw new Error("There should be a subscription here!");
    } else {
        sub.audioPlayer.stop();
       
    }
}

export function stop(sn: Snowflake): void {         //Pass existing connection here
    const sub = subscriptions.get(sn);
    if (!sub) {
        throw new Error("There should be a subscription here!");
    } else {
        sub.stop();
        const connection = connections.get(sn);
        if(connection){
            connection.destroy();
            connections.delete(sn);
        }

        
    }
}

export async function connectToChannel(channel: VoiceChannel) {
    const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guildId,
        adapterCreator: createDiscordJSAdapter(channel),
    });

    connections.set(channel.guildId, connection);
    subscribe(connection, channel.guildId);

    try {
        await entersState(connection, VoiceConnectionStatus.Ready, 30e3);
        return connection;
    } catch (error) {
        connection.destroy();
        throw error;
    }
}

export async function playSong(parsedUserCommand: CommandContext, args: string[]) {
    const track = await Track.from(args[0], {
        async onStart() {
            await parsedUserCommand.originalMessage.reply(`Now Playing: **${track.title}**`);
        },
        async onFinish() {
            await parsedUserCommand.originalMessage.channel.send(`Finished playing: **${track.title}**`);
        },
        async onError(error) {
            console.warn(error);
            await parsedUserCommand.originalMessage.channel.send('There was an unespected error!');
        },
    });

    enqueue(parsedUserCommand.originalMessage.guildId!, track);
    await parsedUserCommand.originalMessage.channel.send(`**${track.title}** was added to the queue!`);
}

