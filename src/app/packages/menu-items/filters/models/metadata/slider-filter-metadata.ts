import { Filter } from './../filter';
import { FilterMetadata } from './filter-metadata.interface';

export class SliderFilterMetadata implements FilterMetadata {

    min: number;
    max: number;

    start: number;
    end: number;

    type: string;

    constructor() {
        this.type = 'Slider';

        this.min = Number.MAX_SAFE_INTEGER;
        this.max = Number.MIN_SAFE_INTEGER;

        this.start = Number.MAX_SAFE_INTEGER;
        this.end = Number.MIN_SAFE_INTEGER;
    }

    updateMetadata(range: { start: number, end: number }): void {
        if (!range || range.start > range.end) {
            return;
        }

        this.start = range.start;
        this.end = range.end;
    }

    accumulateData(value: number): void {
        if (value < this.min) {
            this.min = value;
        }

        if (value > this.max) {
            this.max = value;
        }
    }

    initializeFilter(range: { start: number, end: number }): void {
        this.updateMetadata(range);
    }

    filterFunc(overlay: any, filteringParams: { key: string, metadata: SliderFilterMetadata }): boolean {

        return overlay[filteringParams.key] >= filteringParams.metadata.start &&
            overlay[filteringParams.key] <= filteringParams.metadata.end;
    }

    getMetadataForOuterState(): { start: number, end: number } {
        return { start: this.start, end: this.end };
    }

    isFiltered(): boolean {
        return this.start > this.min || this.end < this.max;
    }

    showAll(): void {
        this.start = this.min;
        this.end = this.max;
    }
}
