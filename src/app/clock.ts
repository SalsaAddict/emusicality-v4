export interface ISynchronize { (beats: number): void; }

export class Clock {
    constructor(
        private readonly audioContext: AudioContext,
        bpm: number,
        private readonly startOffset: number,
        private synchronize: ISynchronize) {
        this._bpm = bpm;
    }
    private _playbackRate: number = 1;
    get playbackRate() { return this._playbackRate; }
    private _bpm: number;
    get bpm() { return this._bpm * this._playbackRate; }
    get secondsPerBeat() { return 60 / this.bpm; }
    private _seconds: number = 0;
    get seconds() { return this._seconds; }
    private secondsToBeats(seconds: number) {
        if (seconds <= this.startOffset) return 0;
        return Math.floor((seconds - this.startOffset) / this.secondsPerBeat) + 1;
    }
    private _beats: number = 0;
    get beats() { return this._beats; }
    goToBeat(beats: number, offset: number = 0) {
        beats = beats + offset > 0 ? beats + offset : 0;
        this._seconds = beats > 0 ? beats * this.secondsPerBeat + this.startOffset : 0;
        this.synchronize(beats);
    }
    private _frameHandle?: number;
    start(seconds = this.audioContext.currentTime) {
        this._frameHandle = requestAnimationFrame(() => {
            let elapsed = -seconds + (seconds = this.audioContext.currentTime);
            this._seconds += (elapsed * this._playbackRate);
            this._beats = this.secondsToBeats(this._seconds);
            this.synchronize(this._beats);
            this.start(seconds);
        });
    }
    stop() { cancelAnimationFrame(this._frameHandle!); }
}
