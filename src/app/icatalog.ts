export interface ICatalog {
    $schema: "../schemas/catalog.json";
    songs: ISongs;
}

export interface ISongs { [id: string]: ISong }

export class ISong {
    constructor(iSong: ISong) {
        this.title = iSong.title;
        this.artist = iSong.artist;
        this.genre = iSong.genre;
        this.bpm = iSong.bpm;
    }
    readonly title: string;
    readonly artist: string;
    readonly genre: string;
    readonly bpm: number;
}
