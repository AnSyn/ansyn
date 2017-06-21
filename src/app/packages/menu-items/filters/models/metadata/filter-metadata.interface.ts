import { Filter } from './../filter';

export abstract class FilterMetadata {
    type: string;    
    resetMetadata(): void {}
    updateMetadata(value: any): void {}
};
