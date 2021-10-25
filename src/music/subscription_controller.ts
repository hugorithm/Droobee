import { VoiceConnection } from "@discordjs/voice";
import { Snowflake } from "discord.js";
import { MusicSubscription } from "./subscription";
import { Track } from "./track";

const subscriptions = new Map<Snowflake, MusicSubscription>();

export function enqueue(sn: Snowflake, track: Track): void {
    const sub = subscriptions.get(sn);
    if (!sub) {
        throw Error("There should be a subscription here!");
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
        throw Error("There should be a subscription here!");
    } else {
        sub.audioPlayer.stop();
       
    }
}

export function stop(sn: Snowflake): void {         //Pass existing connection here
    const sub = subscriptions.get(sn);
    if (!sub) {
        throw Error("There should be a subscription here!");
    } else {
        sub.stop();
        // connection.destroy();
    }
}

