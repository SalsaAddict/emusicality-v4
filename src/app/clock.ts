export class Clock {
    constructor(
        private readonly audioContext: AudioContext,
        bpm: number,
        private readonly startOffset: number) {
        this._bpm = bpm;
    }
    private _playbackRate: number = 1;
    get playbackRate() { return this._playbackRate; }
    private _bpm: number;
    get bpm() { return this._bpm * this._playbackRate; }
    get secondsPerBeat() { return 60 / this.bpm; }
    private _seconds: number = 0;
    get seconds() { return this._seconds; }
    private _beats: number = 0;
    get beats() { return this._beats; }



}
