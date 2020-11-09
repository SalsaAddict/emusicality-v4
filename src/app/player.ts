import { ElementSchemaRegistry } from '@angular/compiler';
import { Clock } from './clock';
import { ITrack } from './ibreakdown';
import { Track } from './track';

export class Player {
    constructor(private readonly path: string, bpm: number, startOffset: number) {
        this.audioContext = new AudioContext();
        this.masterGainNode = this.audioContext.createGain();
        this.clock = new Clock(this.audioContext, bpm, startOffset);
    }
    private audioContext: AudioContext;
    private masterGainNode: GainNode;
    private audioElements: HTMLAudioElement[] = [];
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
    play() {
        this.audioElements.forEach((element) => {
            element.play()
        });
    }
}
