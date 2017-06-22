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

    updateMetadata(value: any): void {
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
}
