import { ITrack } from './ibreakdown';

export class Track {
    constructor(
        private readonly sourceNode: MediaElementAudioSourceNode,
        private readonly gainNode: GainNode,
        private readonly masterGainNode: GainNode,
        readonly description: string,
        readonly group?: string) { }
}
