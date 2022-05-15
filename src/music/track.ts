import { getInfo, thumbnail } from 'ytdl-core';
import { AudioResource, createAudioResource, demuxProbe } from '@discordjs/voice';
import { raw as ytdl } from 'youtube-dl-exec';

export interface TrackData {
	id: number;
	url: string;
	title: string;
	thumbnail: string;
	duration: string;
	ageRestricted: boolean;
	onStart: () => void;
	onFinish: () => void;
	onError: (error: Error) => void;
}

let index = 0;

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => { };

/**
 * A Track represents information about a YouTube video (in this context) that can be added to a queue.
 * It contains the title and URL of the video, as well as functions onStart, onFinish, onError, that act
 * as callbacks that are triggered at certain points during the track's lifecycle.
 *
 * Rather than creating an AudioResource for each video immediately and then keeping those in a queue,
 * we use tracks as they don't pre-emptively load the videos. Instead, once a Track is taken from the
 * queue, it is converted into an AudioResource just in time for playback.
 */
export class Track implements TrackData {
	public readonly id: number;
	public readonly url: string;
	public readonly title: string;
	public readonly thumbnail: string;
	public readonly duration: string;
	public readonly ageRestricted: boolean;
	public readonly onStart: () => void;
	public readonly onFinish: () => void;
	public readonly onError: (error: Error) => void;

	private constructor({ id, url, thumbnail, duration, ageRestricted, title, onStart, onFinish, onError }: TrackData) {
		this.id = id;
		this.url = url;
		this.title = title;
		this.thumbnail = thumbnail;
		this.duration = duration;
		this.ageRestricted = ageRestricted;
		this.onStart = onStart;
		this.onFinish = onFinish;
		this.onError = onError;
	}

	/**
	 * Creates an AudioResource from this Track.
	 */


	public createAudioResource(): Promise<AudioResource<Track>> {
		return new Promise((resolve, reject) => {
			const process = ytdl(
				this.url,
				{
					o: '-',
					q: '',
					f: 'bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio',
					r: '100K',
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
						.then((probe) => resolve(createAudioResource(probe.stream, { metadata: this, inputType: probe.type })))
						.catch(onError);
				})
				.catch(onError);
		});
	}

	/**
	 * Creates a Track from a video URL and lifecycle callback methods.
	 *
	 * @param url The URL of the video
	 * @param methods Lifecycle callbacks
	 * @returns The created Track
	 */
	public static async from(url: string, methods: Pick<Track, 'onStart' | 'onFinish' | 'onError'>): Promise<Track> {
		const info = await getInfo(url);

		// The methods are wrapped so that we can ensure that they are only called once.
		const wrappedMethods = {
			onStart() {
				wrappedMethods.onStart = noop;
				methods.onStart();
			},
			onFinish() {
				wrappedMethods.onFinish = noop;
				methods.onFinish();
			},
			onError(error: Error) {
				wrappedMethods.onError = noop;
				methods.onError(error);
			},
		};

		const thumbnail = info.videoDetails.thumbnails.sort((a, b) => b.height * b.width - a.height * a.width)[0];

		return new Track({
			id: index++,
			title: info.videoDetails.title,
			thumbnail: thumbnail.url, //assume first thumbnail
			duration: this.formatTime(info.videoDetails.lengthSeconds),
			ageRestricted: info.videoDetails.age_restricted,
			url,
			...wrappedMethods,
		});
	}

	public static formatTime(time: string): string {
		try {
			const parsedTime = parseInt(time);
			const minutes = Math.floor(parsedTime / 60);
			const seconds = parsedTime - minutes * 60;
			return minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
		} catch (err) {
			throw err;
		}
	}
}