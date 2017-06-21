import { isNil } from 'lodash';
import { Filter } from './../filter';
import { FilterMetadata } from './filter-metadata.interface';

export class EnumFilterMetadata implements FilterMetadata {

    enumsFields: any;
    type: string;

    constructor() {
        this.enumsFields = {};
        this.type = 'Enum';
    }

    updateMetadata(value: any): void {
        if (!this.enumsFields[value]) {
            this.enumsFields[value] = 1;
        } else {
            this.enumsFields[value] = this.enumsFields[value] + 1;
        }
    }

    resetMetadata(): void {
        this.enumsFields = {};
    }
}
