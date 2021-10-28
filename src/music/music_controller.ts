import { entersState, joinVoiceChannel, VoiceConnection, VoiceConnectionStatus } from "@discordjs/voice";
import { Snowflake, VoiceChannel } from "discord.js";
import { createDiscordJSAdapter } from "../adapters/adapter";
import { CommandContext } from "../models/command_context";
import { MusicSubscription } from "./subscription";
import { Track } from "./track";

const subscriptions = new Map<Snowflake, MusicSubscription>();


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
        sub.voiceConnection.destroy();
        subscriptions.delete(sn);
    }
}

export function pause(sn: Snowflake): void {
    const sub = subscriptions.get(sn);
    if (!sub) {
        throw new Error("There should be a subscription here!");
    } else {
        sub.audioPlayer.pause();
    }
}

export function unpause(sn: Snowflake): void {
    const sub = subscriptions.get(sn);
    if (!sub) {
        throw new Error("There should be a subscription here!");
    } else {
        sub.audioPlayer.unpause();
    }
}

export function getQueue(sn: Snowflake): Track[] {
    const sub = subscriptions.get(sn);
    if (!sub) {
        throw new Error("There should be a subscription here!");
    } else {
        return sub.getQueue();
    }
}

export async function connectToChannel(channel: VoiceChannel) {
    const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guildId,
        adapterCreator: createDiscordJSAdapter(channel),
    });

    subscribe(connection, channel.guildId);

    try {
        await entersState(connection, VoiceConnectionStatus.Ready, 30e3);
        return connection;
    } catch (error) {
        connection.destroy();
        throw error;
    }
}

export async function playSong(parsedUserCommand: CommandContext, arg: string) {
    const track = await Track.from(arg, {
        async onStart() {
            await parsedUserCommand.originalMessage.channel.send(`Now Playing: **${track.title}**`);
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
    await parsedUserCommand.originalMessage.channel.send(`**${track.title}** was added to the playlist!`);
}

