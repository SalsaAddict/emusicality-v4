import { UnaryExpression } from 'typescript';

export interface IBreakdown {
    $schema: "../../schemas/breakdown.json";
    startOffset?: number;
    beatsPerMeasure: number;
    tracks: ITracks;
    sections: ISection[];
}

export type ITracks = (string | ITrack | IGroup)[];

export interface ITrack {
    description: string;
    filename: string;
}

export function isIGroup(o: string | ITrack | IGroup): o is IGroup {
    if (typeof o === "string") return false;
    else return (o as ITrack).filename === undefined;
}

export interface IGroup {
    [name: string]: (string | ITrack)[];
}

export interface ISection {
    description: string;
    framework?: string;
    measures: IMeasures;
}

export type IMeasures = number | (number | string | IMeasure)[];

export interface IMeasure {
    length?: number;
    framework?: string;
    warning?: boolean;
}

export interface IRangeStart {
    startIndex: number;
}

export interface IRange extends IRangeStart {
    startIndex: number;
    endIndex: number;
    length: number;
}

export function inRange(index: number, ...ranges: (IRange | undefined)[]): boolean {
    let result = true;
    for (let i = 0; i < ranges.length; i++)
        if (!(ranges[i] !== undefined && index >= ranges[i]!.startIndex && index <= ranges[i]!.endIndex)) {
            result = false;
            break;
        }
    return result;
}

export type IContext = "info" | "warning" | "danger";
