import { FilterMetadata } from './filter-metadata.interface';
import { FilterType } from '../filter-type';
import { ICaseFilter } from '../../../menu-items/cases/models/case.model';
import { IOverlay } from '../../../overlays/models/overlay.model';
import { Injectable } from "@angular/core";

@Injectable()
export class ArrayFilterMetadata extends FilterMetadata {
	fields = new Map<string, boolean>();
	type: FilterType = FilterType.Array;
	count = 0;
	filteredCount = 0;

	updateMetadata(key: string): void {
		if (this.fields.has(key)) {
			this.fields.set(key, !this.fields.get(key));
		}
	}

	accumulateData(value: string[]): void {
		value.forEach((key) => {
			this.fields.set(key, false);
		});
		this.count++;
	}

	incrementFilteredCount(value: number): void {
		this.filteredCount++;
	}

	resetFilteredCount(): void {
		this.filteredCount = 0;
	}

	hasResults(): boolean {
		return true;
	}

	initializeFilter(overlays: IOverlay[], modelName: string, caseFilter?: ICaseFilter<[string, boolean][]>, visibility?: boolean): void {
		super.initializeFilter(overlays, modelName, caseFilter, visibility);
		this.fields = new Map<string, boolean>();

		overlays.forEach((overlay: any) => {
			this.accumulateData(overlay[modelName]);
		});

		if (caseFilter && Array.isArray(caseFilter.metadata)) {
			caseFilter.metadata.forEach(([key, value]: [string, boolean]) => {
				if (this.fields.has(key)) {
					this.fields.set(key, value);
				}
			});
		}
	}

	filterFunc(overlay: any, key: string): boolean {
		return Array.from(this.fields).every(([fieldsKey, value]) => {
			if (value) {
				return (overlay[key] || []).includes(fieldsKey);
			}
			return true;
		});
	}

	getMetadataForOuterState(): [string, boolean][] {
		return Array.from(this.fields);
	}

	isFiltered(): boolean {
		return Array.from(this.fields.values()).some((bool) => bool);
	}

	showAll(): void {
		this.fields.forEach((value, key, map) => {
			map.set(key, false);
		});
	}

	shouldBeHidden(): boolean {
		return !this.visible;
	}
}
