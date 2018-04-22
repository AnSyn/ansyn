import { Layer } from '../layer';

export abstract class LayerMetadata {

	abstract initializeLayer(value: any, layer?: Layer): void;

	abstract accumulateData(value: any): void;

	abstract postInitializeLayer(value: any): void;

	abstract updateMetadata(value: any): void;

	abstract layerFunc(ovrelay: any, layeringParams: any): boolean;

	abstract getMetadataForOuterState(): any;

	abstract isLayered(): boolean;

	abstract showAll(): void;
}

