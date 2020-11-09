import { IRange, IRangeStart, ISection } from './ibreakdown';
import { Measure } from './measure';
import { Measures } from './measures';

export class Section implements ISection, IRange {
    constructor(iSection: ISection, startIndex: IRangeStart, beatsPerMeasure: number) {
        this.description = iSection.description;
        this.startIndex = startIndex.startIndex;
        this.measures = Measures.load(iSection.measures, startIndex, beatsPerMeasure, iSection.framework);
        this.endIndex = startIndex.startIndex - 1;
        this.length = this.endIndex - this.startIndex + 1;
    }
    readonly description: string;
    readonly measures: Measure[];
    readonly startIndex: number;
    readonly endIndex: number;
    readonly length: number;
}
