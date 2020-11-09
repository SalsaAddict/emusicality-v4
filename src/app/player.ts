import { Clock, ISynchronize } from './clock';
import { ITrack } from './ibreakdown';
import { Track } from './track';

export function setGain(gainNode: GainNode, value: number, seconds: number) {
    return new Promise<void>((resolve) => {
        if (gainNode.context.state !== "running" || seconds === 0) {
            gainNode.gain.value = value;
            resolve();
        }
        else {
            gainNode.gain.linearRampToValueAtTime(value, gainNode.context.currentTime + seconds);
            setTimeout(() => { resolve(); }, seconds * 1000);
        }
    });
}

export class Player {
    constructor(private readonly path: string, bpm: number, startOffset: number, synchronize: ISynchronize) {
        this.audioContext = new AudioContext();
        this.masterGainNode = this.audioContext.createGain();
        this.masterGainNode.connect(this.audioContext.destination);
        this.clock = new Clock(this.audioContext, bpm, startOffset, synchronize);
    }
    private readonly audioContext: AudioContext;
    private readonly masterGainNode: GainNode;
    private readonly audioElements: HTMLAudioElement[] = [];
    readonly clock: Clock;
    createTrack(track: string | ITrack, group?: string): Track {
        let audioElement: HTMLAudioElement = document.createElement("audio"),
            sourceNode = this.audioContext.createMediaElementSource(audioElement),
            gainNode = this.audioContext.createGain(),
            masterGainNode = this.audioContext.createGain(),
            description: string, filename: string;
        if (typeof track === "string") {
            description = track;
            filename = `${this.path}${track.toLowerCase()}.mp3`;
        }
        else {
            description = track.description;
            filename = `${this.path}${track.filename}`;
        }
        audioElement.src = filename;
        audioElement.preload = "auto";
        sourceNode.connect(gainNode).connect(masterGainNode).connect(this.masterGainNode);
        this.audioElements.push(audioElement);
        return new Track(sourceNode, gainNode, masterGainNode, description, group);
    }
    private _busyQueue: null[] = [];
    get busy() { return this._busyQueue.length > 0; }
    private _playing: boolean = false;
    get playing() { return this._playing; }
    async resume() {
        this._busyQueue.push(null);
        if (this.audioContext.state !== "running")
            await this.audioContext.resume();
        console.log("emu:player:resume");
        this._busyQueue.pop();
    }
    async suspend() {
        this._busyQueue.push(null);
        if (this.audioContext.state !== "suspended")
            await this.audioContext.suspend();
        console.log("emu:player:suspend");
        this._busyQueue.pop();
    }
    async seek(seconds = this.clock.seconds) {
        this._busyQueue.push(null);
        let promises: Promise<void>[] = [];
        this.audioElements.forEach((e) => {
            promises.push(new Promise<void>((resolve) => {
                e.currentTime = seconds;
                e.oncanplaythrough = function () { resolve(); };
            }));
        });
        await Promise.all(promises);
        console.log("emu:player:seek", seconds);
        this._busyQueue.pop();
    }
    async play(fadeInBeats: number = 0) {
        this._busyQueue.push(null);
        if (this.clock.beats < fadeInBeats) fadeInBeats = 0;
        this.masterGainNode.gain.value = fadeInBeats > 0 ? 0 : 1;
        let promises: Promise<void>[] = [];
        this.audioElements.forEach(e => promises.push(e.play()));
        await Promise.all(promises);
        this._playing = true;
        await this.unmute(fadeInBeats);
        console.log("emu:player:play", this.clock.seconds, fadeInBeats);
        this._busyQueue.pop();
    }
    async pause(fadeOutBeats: number = 0) {
        this._busyQueue.push(null);
        let promises: Promise<void>[] = [];
        this.audioElements.forEach((e) => {
            promises.push(new Promise<void>(async (resolve) => {
                e.onpause = function () { resolve(); }
                await this.mute(fadeOutBeats);
                e.pause();
            }));
        });
        await Promise.all(promises);
        this._playing = false;
        console.log("emu:player:pause", this.clock.seconds, fadeOutBeats);
        this._busyQueue.pop();
    }
    async mute(fadeOutBeats: number) {
        this._busyQueue.push(null);
        await setGain(this.masterGainNode, 0, fadeOutBeats * this.clock.secondsPerBeat);
        this._busyQueue.pop();
    }
    async unmute(FadeInBeats: number) {
        this._busyQueue.push(null);
        await setGain(this.masterGainNode, 1, FadeInBeats * this.clock.secondsPerBeat);
        this._busyQueue.pop();
    }
}
