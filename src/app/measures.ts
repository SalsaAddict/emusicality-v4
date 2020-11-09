import { IContext, IMeasures, IRangeStart } from './ibreakdown';
import { Measure } from './measure';

export class Measures {
    static load(iMeasures: IMeasures, startIndex: IRangeStart, beatsPerMeasure: number, framework?: string): Measure[] {
        let measures: Measure[] = [];
        if (typeof iMeasures === "number")
            for (let i = 0; i < iMeasures; i++)
                measures.push(new Measure(startIndex, beatsPerMeasure, "primary", framework));
        else
            iMeasures.forEach((measure) => {
                let length = beatsPerMeasure, context: IContext = "primary", warning: boolean = false;
                if (typeof measure === "string")
                    framework = measure;
                else if (typeof measure === "number") {
                    if (measure > 0) length = measure;
                    if (measure < 0) warning = true;
                }
                else {
                    framework = measure.framework ?? framework;
                    length = measure.length ?? beatsPerMeasure;
                }
                context = length !== beatsPerMeasure ? "danger" : warning ? "warning" : "primary";
                measures.push(new Measure(startIndex, length, context, framework));
            });
        return measures;
    }
}
