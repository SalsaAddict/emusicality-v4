import { IMeasure, IRange, IContext, IRangeStart } from './ibreakdown';

export class Measure implements IMeasure, IRange {
    constructor(startIndex: IRangeStart, length: number, context: IContext, framework?: string) {
        this.framework = framework;
        this.context = context;
        this.warning = context !== "primary";
        this.startIndex = startIndex.startIndex;
        this.endIndex = startIndex.startIndex + length - 1;
        this.length = length;
        startIndex.startIndex += length;
    }
    readonly framework?: string;
    readonly context: IContext;
    readonly warning: boolean;
    readonly startIndex: number;
    readonly endIndex: number;
    readonly length: number;
}
