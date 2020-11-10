import { ICatalog, ISong } from './icatalog';
import { IBreakdown, IRangeStart, IRange, inRange } from './ibreakdown';
import { Sections } from './sections';
import { Section } from './section';
import { HttpClient } from '@angular/common/http';
import { Player } from './player';
import { Tracks } from './tracks';
import { Track } from './track';
import { Measure } from './measure';

export class Song extends ISong implements ISong, IRange {
    static load(http: HttpClient, songId: string) {
        return new Promise<Song>((resolve) => {
            let path = "assets/songs/"
            http.get<ICatalog>(`${path}catalog.json`)
                .subscribe((iCatalog) => {
                    path += `${songId}/`;
                    http.get<IBreakdown>(`${path}breakdown.json`)
                        .subscribe((iBreakdown) => {
                            resolve(new Song(iCatalog.songs[songId], iBreakdown, path));
                        });
                });
        });
    }
    static readonly fadeInBeats: number = 2;
    static readonly fadeOutBeats: number = 1;
    constructor(iSong: ISong, iBreakdown: IBreakdown, readonly path: string) {
        super(iSong);
        let startIndex: IRangeStart = { startIndex: 1 }
        this.player = new Player(path, iSong.bpm, iBreakdown.startOffset ?? 0, this.synchronize);
        this.startIndex = startIndex.startIndex;
        this.sections = Sections.load(iBreakdown.sections, startIndex, iBreakdown.beatsPerMeasure);
        this.tracks = Tracks.load(this.player, iBreakdown.tracks);
        this.endIndex = startIndex.startIndex - 1;
        this.length = this.endIndex - this.startIndex + 1;
        this.player.clock.synchronize();
    }
    private readonly player: Player;
    readonly sections: Section[];
    readonly tracks: Track[];
    readonly startIndex: number;
    readonly endIndex: number;
    readonly length: number;
    private _section?: Section;
    get section() { return this._section; }
    private _measure?: Measure;
    get measure() { return this._measure; }
    private _beat?: number;
    get beat() { return this._beat; }
    private synchronize = (beats: number) => {
        if (inRange(beats, this)) {
            if (!inRange(beats, this._section)) {
                delete this._measure; delete this._section;
                for (let i = 0; i < this.sections.length; i++)
                    if (inRange(beats, this.sections[i])) {
                        this._section = this.sections[i];
                        break;
                    }
            }
            if (this._section && !inRange(beats, this._measure)) {
                delete this._measure;
                for (let i = 0; i < this._section!.measures.length; i++)
                    if (inRange(beats, this._section!.measures[i])) {
                        this._measure = this._section!.measures[i];
                        break;
                    }
            }
            this._beat = this._measure ? beats - this._measure!.startIndex + 1 : undefined;
        }
        else {
            if (beats < this.startIndex) {
                this._section = this.sections[0];
                this._measure = this.section!.measures[0];
            }
            else {
                this._section = this.sections[this.sections.length - 1];
                this._measure = this.section!.measures[this.section!.measures.length - 1];
            }
            this._beat = undefined;
        }
    }
    get busy() { return this.player.busy; }
    get playing() { return this.player.playing; }
    async play() {
        if (this.player.playing) return;
        await this.player.resume();
        await this.player.seek();
        this.player.clock.start();
        await this.player.play(Song.fadeInBeats);
    }
    async pause() {
        if (!this.player.playing) return;
        await this.player.pause(Song.fadeOutBeats);
        this.player.clock.stop();
        await this.player.suspend();
    }
    private async goToBeat(beat: number) {
        if (this.playing) {
            await this.player.mute(Song.fadeOutBeats);
            this.player.clock.goToBeat(beat, -Song.fadeInBeats);
            await this.player.seek();
            await this.player.unmute(Song.fadeInBeats);
        }
        else this.player.clock.goToBeat(beat, 0);
    }
    async restart() {
        await this.goToBeat(0);
    }
    async previous() {
        if (this.section!.startIndex === 1) return;
        let startIndex: number;
        if (inRange(this.player.clock.beats, this.section!.measures[0])) {
            let index = this.sections.indexOf(this.section!);
            startIndex = this.sections[index - 1].startIndex;
        }
        else startIndex = this.section!.startIndex;
        await this.goToBeat(startIndex);
    }
    async next() {
        if (this.section!.endIndex === this.endIndex) return;
        let startIndex = this.section!.startIndex + this.section!.length;
        await this.goToBeat(startIndex);
    }
}
