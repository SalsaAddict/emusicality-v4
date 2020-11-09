import { IRangeStart, ISection } from './ibreakdown';
import { Section } from './section';

export class Sections {
    static load(iSections: ISection[], startIndex: IRangeStart, beatsPerMeasure: number) {
        let sections: Section[] = [];
        iSections.forEach((section) => sections.push(new Section(section, startIndex, beatsPerMeasure)));
        return sections;
    }
}
