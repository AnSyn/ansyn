import { FilterType } from '../filter-type';
import { IOverlay } from '../../../../overlays/models/overlay.model';
import { ICaseFilter } from '../../../cases/models/case.model';

export abstract class FilterMetadata {
	type: FilterType;
	visible: boolean;

	initializeFilter(overlays: IOverlay[], modelName: string, caseFilter?: ICaseFilter, visible?: boolean) {
		this.visible = visible !== undefined ? visible : true;
	};

	abstract accumulateData(value: any): void;

	abstract incrementFilteredCount(value: any): void;

	abstract updateMetadata(value: any): void;

	abstract filterFunc(ovrelay: any, filteringParams: any): boolean;

	abstract getMetadataForOuterState(): any;

	abstract isFiltered(): boolean;

	abstract resetFilteredCount(): void;

	abstract showAll(): void;

	abstract shouldBeHidden(): boolean;
}

