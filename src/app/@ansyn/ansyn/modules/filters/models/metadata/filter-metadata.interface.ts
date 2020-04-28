import { FilterType } from '../filter-type';
import { IOverlay } from '../../../overlays/models/overlay.model';
import { ICaseFilter } from '../../../menu-items/cases/models/case.model';

export abstract class FilterMetadata {
	type: FilterType;
	visible: boolean;
	collapse: boolean;

	initializeFilter(overlays: IOverlay[], modelName: string, caseFilter?: ICaseFilter, visible?: boolean) {
		this.visible = visible !== undefined ? visible : true;
		this.collapse = false;
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

