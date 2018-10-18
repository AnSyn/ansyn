import { FilterMetadata } from './filter-metadata.interface';
import { FilterType, ICaseBooleanFilterMetadata, ICaseFilter, ICaseSliderFilterMetadata, IOverlay } from '@ansyn/core';
import { Inject } from '@angular/core';
import { filtersConfig } from '../../services/filters.service';
import { IFiltersConfig } from '../filters-config';

export interface ISliderFilterModel {
	count: number;
	filteredCount: number;
	min: number;
	max: number;
	start: number;
	end: number;
}

export class SliderFilterMetadata extends FilterMetadata<ISliderFilterModel> {
	constructor(@Inject(filtersConfig) protected config: IFiltersConfig) {
		super(FilterType.Slider, config);
	}

	initialModelObject(): ISliderFilterModel {
		return {
			count: 0,
			filteredCount: 0,
			min: Number.MAX_SAFE_INTEGER,
			max: Number.MIN_SAFE_INTEGER,
			start: -Infinity,
			end: Infinity,
		}
	}
	updateMetadata(model: string, range: { start: number, end: number }): void {
		if (!range || (range.start && range.end && range.start > range.end)) {
			return;
		}

		this.models[model].start = range.start || -Infinity;
		this.models[model].end = range.end || Infinity;
	}

	accumulateData(model: string, value: number): void {
		if (value < this.models[model].min) {
			this.models[model].min = value;
		}

		if (value > this.models[model].max) {
			this.models[model].max = value;
		}
		this.models[model].count++;
	}

	incrementFilteredCount(model: string, value: number): void {
		this.models[model].filteredCount++;
	}

	resetFilteredCount(model: string): void {
		this.models[model].filteredCount = 0;
	}

	initializeFilter(overlays: IOverlay[], caseFilters: ICaseFilter<ICaseSliderFilterMetadata>[] = []): void {
		Object.entries(this.models).forEach(([model, sliderFilterModel]: [string, ISliderFilterModel]) => {

			sliderFilterModel.count = 0;

			overlays.forEach((overlay: any) => {
				this.accumulateData(model, overlay[model]);
			});

			const caseFilter = caseFilters.find(({ type, fieldName }: ICaseFilter) => this.type === type && model === fieldName);
			if (caseFilter) {
				this.updateMetadata(model, caseFilter.metadata);
			}
		});

	}

	filterFunc(overlay: any, key: string): boolean {
		return overlay[key] >= this.models[key].start &&
			overlay[key] <= this.models[key].end;
	}

	getMetadataForOuterState(): ICaseFilter<ICaseSliderFilterMetadata>[] {
		return Object.entries(this.models).map(([fieldName, sliderFilterModel]) => {
			let metadata;
			if (sliderFilterModel.start === -Infinity && sliderFilterModel.end === Infinity) {
				metadata = null;
			}
			metadata = { start: sliderFilterModel.start, end: sliderFilterModel.end };
			return {
				type: this.type,
				fieldName,
				metadata
			};
		});
	}

	isFiltered(model: string): boolean {
		return this.models[model].start > this.models[model].min || this.models[model].end < this.models[model].max;
	}

	showAll(model: string): void {
		this.models[model].start = -Infinity;
		this.models[model].end = Infinity;
	}

	shouldBeHidden(model: string): boolean {
		return this.models[model].min === this.models[model].max;
	}
}
