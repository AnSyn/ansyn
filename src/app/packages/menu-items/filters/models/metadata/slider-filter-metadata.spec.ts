import { Filter } from './../filter';
import { FilterMetadata } from './filter-metadata.interface';
import { SliderFilterMetadata } from './slider-filter-metadata';

describe('SliderFilterMetadata', () => {
    let sliderFilterMetadata: SliderFilterMetadata;

    beforeEach(() => {
        sliderFilterMetadata = new SliderFilterMetadata();
    });

    it('should be defined', () => {
        expect(sliderFilterMetadata).toBeDefined();
    });

    describe('updateMetadata', () => {

        it('normal range should change initial values', () => {
            const initialStart: number = sliderFilterMetadata.start;
            const initialEnd: number = sliderFilterMetadata.end;
            const initialMin: number = sliderFilterMetadata.min;
            const initialMax: number = sliderFilterMetadata.max;

            sliderFilterMetadata.updateMetadata({ start: 7, end: 8 });

            expect(sliderFilterMetadata.start).toBe(7);
            expect(sliderFilterMetadata.end).toBe(8);
            expect(sliderFilterMetadata.min).toBe(initialMin);
            expect(sliderFilterMetadata.max).toBe(initialMax);
        });

        it('unacceptable range should not change initial values', () => {
            const initialStart: number = sliderFilterMetadata.start;
            const initialEnd: number = sliderFilterMetadata.end;
            const initialMin: number = sliderFilterMetadata.min;
            const initialMax: number = sliderFilterMetadata.max;

            sliderFilterMetadata.updateMetadata({ start: 8, end: 7 });

            expect(sliderFilterMetadata.start).toBe(initialStart);
            expect(sliderFilterMetadata.end).toBe(initialEnd);
            expect(sliderFilterMetadata.min).toBe(initialMin);
            expect(sliderFilterMetadata.max).toBe(initialMax);
        });
    });

    describe('accumulateData', () => {
        it('accumulate with single value should update min and max values', () => {
            const initialStart: number = sliderFilterMetadata.start;
            const initialEnd: number = sliderFilterMetadata.end;
            const initialMin: number = sliderFilterMetadata.min;
            const initialMax: number = sliderFilterMetadata.max;

            sliderFilterMetadata.accumulateData(7);

            expect(sliderFilterMetadata.start).toBe(initialStart);
            expect(sliderFilterMetadata.end).toBe(initialEnd);
            expect(sliderFilterMetadata.min).toBe(7);
            expect(sliderFilterMetadata.max).toBe(7);
        });

        it('accumulate with two values with the second bigger should update min and max values', () => {
            const initialStart: number = sliderFilterMetadata.start;
            const initialEnd: number = sliderFilterMetadata.end;
            const initialMin: number = sliderFilterMetadata.min;
            const initialMax: number = sliderFilterMetadata.max;

            sliderFilterMetadata.accumulateData(7);
            sliderFilterMetadata.accumulateData(8);

            expect(sliderFilterMetadata.start).toBe(initialStart);
            expect(sliderFilterMetadata.end).toBe(initialEnd);
            expect(sliderFilterMetadata.min).toBe(7);
            expect(sliderFilterMetadata.max).toBe(8);
        });

        it('accumulate with two values with the second smaller should update min and max values', () => {
            const initialStart: number = sliderFilterMetadata.start;
            const initialEnd: number = sliderFilterMetadata.end;
            const initialMin: number = sliderFilterMetadata.min;
            const initialMax: number = sliderFilterMetadata.max;

            sliderFilterMetadata.accumulateData(7);
            sliderFilterMetadata.accumulateData(6);

            expect(sliderFilterMetadata.start).toBe(initialStart);
            expect(sliderFilterMetadata.end).toBe(initialEnd);
            expect(sliderFilterMetadata.min).toBe(6);
            expect(sliderFilterMetadata.max).toBe(7);
        });
    });

    describe('initializeFilter', () => {

        it('initializeFilter with range should update start and end', () => {
            const initialStart: number = sliderFilterMetadata.start;
            const initialEnd: number = sliderFilterMetadata.end;
            const initialMin: number = sliderFilterMetadata.min;
            const initialMax: number = sliderFilterMetadata.max;

            sliderFilterMetadata.initializeFilter({ start: 6, end: 7 });

            expect(sliderFilterMetadata.start).toBe(6);
            expect(sliderFilterMetadata.end).toBe(7);
            expect(sliderFilterMetadata.min).toBe(initialMin);
            expect(sliderFilterMetadata.max).toBe(initialMax);
        });
    });


    describe('filterFunc', () => {

        it('filterFunc with ovrelay in the range should return true', () => {
            const initialStart: number = sliderFilterMetadata.start;
            const initialEnd: number = sliderFilterMetadata.end;
            const initialMin: number = sliderFilterMetadata.min;
            const initialMax: number = sliderFilterMetadata.max;
            const overlay: any = { value: 6.5 };

            sliderFilterMetadata.initializeFilter({ start: 6, end: 7 });
            const result: boolean = sliderFilterMetadata.filterFunc(overlay, { key: 'value', metadata: sliderFilterMetadata });

            expect(result).toBeTruthy();
        });

        it('filterFunc with ovrelay outside the range should return true', () => {
            const initialStart: number = sliderFilterMetadata.start;
            const initialEnd: number = sliderFilterMetadata.end;
            const initialMin: number = sliderFilterMetadata.min;
            const initialMax: number = sliderFilterMetadata.max;
            const overlay: any = { value: 7.5 };

            sliderFilterMetadata.initializeFilter({ start: 6, end: 7 });
            const result: boolean = sliderFilterMetadata.filterFunc(overlay, { key: 'value', metadata: sliderFilterMetadata });

            expect(result).toBeFalsy();
        });
    });

    describe('getMetadataForOuterState', () => {

        it('getMetadataForOuterState shuold return the right range object', () => {
            const initialStart: number = sliderFilterMetadata.start;
            const initialEnd: number = sliderFilterMetadata.end;
            const initialMin: number = sliderFilterMetadata.min;
            const initialMax: number = sliderFilterMetadata.max;

            sliderFilterMetadata.initializeFilter({ start: 6, end: 7 });
            const result: any = sliderFilterMetadata.getMetadataForOuterState();

            expect(result).toEqual({ start: 6, end: 7 });
        });
    });

    describe('isFiltered', () => {

        it('isFiltered shuold return false when the values are uninitialized', () => {
            const initialStart: number = sliderFilterMetadata.start;
            const initialEnd: number = sliderFilterMetadata.end;
            const initialMin: number = sliderFilterMetadata.min;
            const initialMax: number = sliderFilterMetadata.max;

            const result: any = sliderFilterMetadata.isFiltered();

            expect(result).toBeFalsy();
        });

        it('isFiltered shuold return true when the values are inside the min-max range', () => {
            const initialStart: number = sliderFilterMetadata.start;
            const initialEnd: number = sliderFilterMetadata.end;
            const initialMin: number = sliderFilterMetadata.min;
            const initialMax: number = sliderFilterMetadata.max;

            sliderFilterMetadata.accumulateData(7);
            sliderFilterMetadata.accumulateData(8);
            sliderFilterMetadata.initializeFilter({ start: 7.5, end: 8 });
            const result: any = sliderFilterMetadata.isFiltered();

            expect(result).toBeTruthy();
        });

        it('isFiltered shuold return false when the values are equal to thethe min-max range', () => {
            const initialStart: number = sliderFilterMetadata.start;
            const initialEnd: number = sliderFilterMetadata.end;
            const initialMin: number = sliderFilterMetadata.min;
            const initialMax: number = sliderFilterMetadata.max;

            sliderFilterMetadata.accumulateData(7);
            sliderFilterMetadata.accumulateData(8);
            sliderFilterMetadata.initializeFilter({ start: 7, end: 8 });
            const result: any = sliderFilterMetadata.isFiltered();

            expect(result).toBeFalsy();
        });
    });

    describe('showAll', () => {

        it('showAll shuold set the range to be min-max', () => {
            const initialStart: number = sliderFilterMetadata.start;
            const initialEnd: number = sliderFilterMetadata.end;
            const initialMin: number = sliderFilterMetadata.min;
            const initialMax: number = sliderFilterMetadata.max;

            sliderFilterMetadata.accumulateData(7);
            sliderFilterMetadata.accumulateData(8);
            sliderFilterMetadata.initializeFilter({ start: 6, end: 7 });
            sliderFilterMetadata.showAll();
            
            const result: any = sliderFilterMetadata.getMetadataForOuterState();

            expect(result).toEqual({ start: 7, end: 8 });
        });
    });
});
