import { ICatalog, ISong } from './icatalog';
import { IBreakdown, IRangeStart, IRange } from './ibreakdown';
import { Sections } from './sections';
import { Section } from './section';
import { HttpClient } from '@angular/common/http';
import { Player } from './player';
import { Tracks } from './tracks';
import { Track } from './track';

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
        this.context = new Player(path, iSong.bpm, iBreakdown.startOffset ?? 0);
        this.startIndex = startIndex.startIndex;
        this.sections = Sections.load(iBreakdown.sections, startIndex, iBreakdown.beatsPerMeasure);
        this.tracks = Tracks.load(this.context, iBreakdown.tracks);
        this.endIndex = startIndex.startIndex - 1;
        this.length = this.endIndex - this.startIndex + 1;
    }
    readonly context: Player;
    readonly sections: Section[];
    readonly tracks: Track[];
    readonly startIndex: number;
    readonly endIndex: number;
    readonly length: number;
}
