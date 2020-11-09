import { ICatalog, ISong } from './icatalog';
import { IBreakdown, IRangeStart, IRange, inRange } from './ibreakdown';
import { Sections } from './sections';
import { Section } from './section';
import { HttpClient } from '@angular/common/http';
import { Player, setGain } from './player';
import { Tracks } from './tracks';
import { Track } from './track';
import { Measure } from './measure';

export class Song extends ISong implements ISong, IRange {
    static load(http: HttpClient, songId: string) {
        return new Promise<Song>((resolve, reject) => {
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
    constructor(iSong: ISong, iBreakdown: IBreakdown, readonly path: string) {
        super(iSong);
        let startIndex: IRangeStart = { startIndex: 1 }
        this.player = new Player(path, iSong.bpm, iBreakdown.startOffset ?? 0, this.synchronize);
        this.startIndex = startIndex.startIndex;
        this.sections = Sections.load(iBreakdown.sections, startIndex, iBreakdown.beatsPerMeasure);
        this.tracks = Tracks.load(this.player, iBreakdown.tracks);
        this.endIndex = startIndex.startIndex - 1;
        this.length = this.endIndex - this.startIndex + 1;
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
    get busy() { return this.player.busy; }
    get playing() { return this.player.playing; }
    async play(fadeinBeats: number = 0) {
        if (this.player.playing) return;
        await this.player.resume();
        await this.player.seek();
        this.player.clock.start();
        await this.player.play(fadeinBeats);
    }
    async pause(fadeOutBeats: number = 0) {
        if (!this.player.playing) return;
        await this.player.pause(fadeOutBeats);
        this.player.clock.stop();
        await this.player.suspend();
    }
    async next(fadeOutBeats: number, fadeInBeats: number) {
        let startIndex: number;
        if (this.section) {
            if (this.section.endIndex === this.endIndex) return;
            startIndex = this.section!.startIndex + this.section!.length;
        }
        else {
            startIndex = 1;
            fadeInBeats = 0;
        }
        this.synchronize(startIndex);
        await this.player.mute(fadeOutBeats);
        this.player.clock.goToBeat(startIndex, -fadeInBeats);
        await this.player.seek();
        await this.player.unmute(fadeInBeats);
    }
}
