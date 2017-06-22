import { Filter } from './../filter';

export abstract class FilterMetadata {
    type: string;    
    initializeFilter(value: any): void {}
    updateMetadata(value: any): void {}
};
