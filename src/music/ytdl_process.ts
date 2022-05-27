import { AudioResource, createAudioResource, demuxProbe } from "@discordjs/voice";
import { raw as ytdl } from 'youtube-dl-exec';
import { Track } from './track';
import { parentPort, workerData } from 'node:worker_threads';



parentPort?.postMessage(getYtData(workerData.track));

function getYtData(track: Track): Promise<AudioResource<Track>> {
   return new Promise((resolve, reject) => {
        const process = ytdl(
            track.url,
            {
                output: '-', //o
                quiet: true, //q
                format: 'bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio', //f
                limitRate: '100K', //rgt
            },
            { stdio: ['ignore', 'pipe', 'ignore'] },
        );
        if (!process.stdout) {
            reject(new Error('No stdout'));
            return;
        }
        const stream = process.stdout;
        const onError = (error: Error) => {
            if (!process.killed) process.kill();
            stream.resume();
            reject(error);
        };
        process
            .once('spawn', () => {
                demuxProbe(stream)
                    .then((probe) => resolve(createAudioResource(probe.stream, { metadata: track, inputType: probe.type })))
                    .catch(onError);
            })
            .catch(onError);
    });
}
		