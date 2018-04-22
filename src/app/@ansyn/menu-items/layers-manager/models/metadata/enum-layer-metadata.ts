import { LayerMetadata } from './layer-metadata.interface';
import { Layer } from '../layer';
// import { LayerType } from "@ansyn/menu-items/layers-manager/models/layer-type";

export interface EnumFiled {
	count: number;
	isChecked: boolean;
}

export class EnumLayerMetadata implements LayerMetadata {

	enumsFields: Map<string, EnumFiled>;
	// type: LayerType;

	constructor() {
		this.enumsFields = new Map<string, EnumFiled>();
	}

	updateMetadata(key: string): void {
		if (this.enumsFields.get(key)) {
			this.enumsFields.get(key).isChecked = !this.enumsFields.get(key).isChecked;
		}
	}

	selectOnly(selectedKey: string): void {
		this.enumsFields.forEach((value: EnumFiled, key: string) => {
			value.isChecked = (key === selectedKey);
		});
	}

	accumulateData(value: any): void {
		if (!this.enumsFields.get(value)) {
			this.enumsFields.set(value, { count: 1, isChecked: false });
		} else {
			this.enumsFields.get(value).count = this.enumsFields.get(value).count + 1;
		}
	}

	initializeLayer(selectedValues: string[]): void {
		this.enumsFields = new Map<string, { count: number, isChecked: boolean }>();
		if (selectedValues) {
			for (let key of selectedValues) {
				this.enumsFields.set(key, { count: 0, isChecked: true });
			}
		}
	}

	postInitializeLayer(value: { oldLayersArray: [Layer, EnumLayerMetadata][], name: string }): void {
		this.enumsFields.forEach((value, key, mapObj: Map<any, any>) => {
			if (!value.count) {
				mapObj.delete(key);
			}
		});

		if (value.oldLayersArray) {
			const oldLayerArray = value.oldLayersArray
				.find(([oldLayerKey, oldLayer]: [Layer, LayerMetadata]) => oldLayerKey.name === value.name);


			if (oldLayerArray) {
				const [oldLayerKey, oldLayer] = oldLayerArray;
				const oldLayerFields = (<EnumLayerMetadata>oldLayer).enumsFields;
				const layerFields = this.enumsFields;

				layerFields.forEach((value, key) => {
					let isChecked = true;
					if (oldLayerFields.has(key)) {
						const oldLayer = oldLayerFields.get(key);
						if (!oldLayer.isChecked) {
							isChecked = false;
						}
					}
					value.isChecked = isChecked;
				});
			}
		}
	}

	layerFunc(overlay: any, key: string): boolean {
		if (!overlay) {
			return false;
		}
		const selectedFields: string[] = [];
		this.enumsFields.forEach((value: { count: number, isChecked: boolean }, key: string) => {
			if (value.isChecked) {
				selectedFields.push(key);
			}
		});

		return selectedFields.some((layerParams) => overlay[key] === layerParams);
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

	isLayered(): boolean {
		return Array.from(this.enumsFields.values()).some((value: EnumFiled) => !value.isChecked);
	}

	showAll(): void {
		this.enumsFields.forEach((value: EnumFiled) => {
			value.isChecked = true;
		});
	}
}
