import { FilterMetadata } from './filter-metadata.interface';
import { FilterType, ICaseFilter, ICaseSliderFilterMetadata } from '@ansyn/core';
import { Inject, Injectable } from '@angular/core';
import { filtersConfig } from '../../services/filters.service';
import { IFiltersConfig } from '../filters-config';
import { Store } from '@ngrx/store';
import { UpdateFilterAction } from '../../actions/filters.actions';

export interface ISliderFilterModel {
	count: number;
	filteredCount: number;
	min: number;
	max: number;
	start: number;
	end: number;
}

@Injectable({
	providedIn: 'root'
})
export class SliderFilterMetadata extends FilterMetadata<ISliderFilterModel> {
	constructor(@Inject(filtersConfig) protected config: IFiltersConfig, protected store$: Store<any>) {
		super(FilterType.Slider, config, store$);
	}

	initialModelObject(): ISliderFilterModel {
		return {
			count: 0,
			filteredCount: 0,
			min: Number.MAX_SAFE_INTEGER,
			max: Number.MIN_SAFE_INTEGER,
			start: -Infinity,
			end: Infinity
		};
	}

	updateMetadata(model: string, range: { start: number, end: number }): void {
		if (!range || (range.start && range.end && range.start > range.end)) {
			return;
		}
		this.store$.dispatch(new UpdateFilterAction({
			type: FilterType.Boolean,
			fieldName: model,
			metadata: {
				start: range.start || -Infinity,
				end: range.end || Infinity
			}
		}));
	}

	updateFilter(caseFilter: ICaseFilter<ICaseSliderFilterMetadata>) {
		const modelObject = this.models[caseFilter.fieldName];
		modelObject.start = caseFilter.metadata.start;
		modelObject.end = caseFilter.metadata.end;
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
		this.store$.dispatch(new UpdateFilterAction({
			type: FilterType.Boolean,
			fieldName: model,
			metadata: null
		}));
	}

	shouldBeHidden(model: string): boolean {
		return this.models[model].min === this.models[model].max;
	}
}
