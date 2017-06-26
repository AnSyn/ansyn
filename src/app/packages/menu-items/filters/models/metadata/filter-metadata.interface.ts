import { Filter } from './../filter';

export abstract class FilterMetadata {
    type: string;    
    abstract initializeFilter(value: any): void;
    abstract updateMetadata(value: any): void;
    abstract filterFunc(ovrelay: any, filteringParams:any): boolean;
};
