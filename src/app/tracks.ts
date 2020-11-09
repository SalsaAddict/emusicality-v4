import { Player } from './player';
import { ITracks, isIGroup } from './ibreakdown';
import { Track } from './track';

export class Tracks {
    static load(context: Player, iTracks: ITracks) {
        let tracks: Track[] = [];
        iTracks.forEach((track) => {
            if (isIGroup(track)) {
                Object.keys(track).forEach((group) => {
                    track[group].forEach((t) => {
                        tracks.push(context.createTrack(t, group));
                    });
                });
            }
            else tracks.push(context.createTrack(track));
        });
        return tracks;
    }
}
