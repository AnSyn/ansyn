import { Filter } from './../filter';

export abstract class FilterMetadata {
    type: string;    
    abstract initializeFilter(value: any): void;
    abstract accumulateData(value: any): void;
    abstract updateMetadata(value: any): void;    
    abstract filterFunc(ovrelay: any, filteringParams:any): boolean;
    abstract getMetadataForOuterState(): any;
    abstract isFiltered(): boolean;
    abstract showAll(): void;
};
