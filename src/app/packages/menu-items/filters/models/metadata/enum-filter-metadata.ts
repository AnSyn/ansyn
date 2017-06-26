import { isNil } from 'lodash';
import { Filter } from './../filter';
import { FilterMetadata } from './filter-metadata.interface';

export class EnumFilterMetadata implements FilterMetadata {

    enumsFields: Map<string, { count: number, isChecked: boolean }>;
    type: string;

    constructor() {
        this.enumsFields = new Map<string, { count: number, isChecked: boolean }>();
        this.type = 'Enum';
    }

    updateMetadata(key: string): void {
        this.enumsFields.get(key).isChecked = !this.enumsFields.get(key).isChecked;
    }

    selectOnly(selectedKey: string): void {
        this.enumsFields.forEach((value: { count: number, isChecked: boolean }, key: string) => {
            value.isChecked = (key === selectedKey);
        });
    }

    accumulateData(value: any): void {
        if (!this.enumsFields.get(value)) {
            this.enumsFields.set(value, { count: 1, isChecked: false });
        } else {
            this.enumsFields.get(value)["count"] = this.enumsFields.get(value)["count"] + 1;
        }
    }

    initializeFilter(selectedValues: string[]): void {

        this.enumsFields = new Map<string, { count: number, isChecked: boolean }>();
        if (selectedValues) {
            for (let key of selectedValues) {
                this.enumsFields.set(key, { count: 0, isChecked: true });
            }
        }
    }

    filterFunc(overlay: any, filteringParams: { key: string, metadata: EnumFilterMetadata }): boolean {
        const selectedFields: string[] = [];
        filteringParams.metadata.enumsFields.forEach((value: { count: number, isChecked: boolean }, key: string) => {
            if (value.isChecked) {
                selectedFields.push(key);
            }
        });

        return selectedFields.some((filterParams) => overlay[filteringParams.key] === filterParams);
    }

    getMetadataForOuterState(): string[] {
        const returnValue: string[] = [];

        this.enumsFields.forEach((value: { count: number, isChecked: boolean }, key: string) => {
            if (value.isChecked) {
                returnValue.push(key);
            }
        });

        return returnValue;
    }

    isFiltered(): boolean {
        return Array.from(this.enumsFields.values()).
            some((value: { count: number, isChecked: boolean }) => value.isChecked);
    }

    showAll(): void {
        this.enumsFields.forEach((value: { count: number, isChecked: boolean }, key: string) => {
            value.isChecked = true;
        });
    }
}
