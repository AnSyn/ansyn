import { CaseEnumFilterMetadata, FilterType, ICaseFilter, IOverlay } from '@ansyn/core';
import { IFiltersConfig } from '../filters-config';
import { IFilter } from '../IFilter';
import { selectFilteredOveralys, selectOverlaysMap } from '@ansyn/overlays';
import { filter, map, tap, withLatestFrom } from 'rxjs/operators';
import { select, Store } from '@ngrx/store';
import { selectFilters } from '../../reducer/filters.reducer';

export interface IFilterModel<T = any> {
	[model: string]: T;
}

export abstract class FilterMetadata<M = any> {
	calculateCounts$ = this.store$.select(selectFilteredOveralys).pipe(
		map((filteredOverlays) => this.calculateCounts(filteredOverlays))
	);

	models: IFilterModel<M> = this.config.filters.reduce((obj, item: IFilter) => {
		if (item.type === this.type) {
			return { ...obj, [item.modelName]: this.initialModelObject() };
		}
		return obj;
	}, {});

	abstract initialModelObject(): M;

	initializeFilter(overlays: Map<string, IOverlay>, caseFilters: ICaseFilter[]): void {
		Object.keys(this.models).forEach((model: string) => {
			this.models[model] = this.initialModelObject();
			overlays.forEach((overlay: any) => {
				this.accumulateData(model, overlay[model]);
			});
		});

		this.updateFilters(caseFilters);
	};

	updateFilters(caseFilters: ICaseFilter[]): void {
		caseFilters
			.filter((caseFilter: ICaseFilter) => caseFilter.type === this.type && this.models.hasOwnProperty(caseFilter.fieldName))
			.forEach((caseFilter: ICaseFilter) => {
				this.updateFilter(caseFilter);
			});
	}

	abstract updateFilter(caseFilters: ICaseFilter): void;

	abstract accumulateData(model: string, value: any): void;

	abstract incrementFilteredCount(model: string, value: any): void;

	abstract updateMetadata(model: string, value: any): void;

	abstract filterFunc(model: string, ovrelay: any, filteringParams: any): boolean;

	abstract getMetadataForOuterState(): ICaseFilter[] ;

	abstract isFiltered(model: string): boolean;

	abstract resetFilteredCount(model: string): void;

	abstract showAll(model: string): void;

	abstract shouldBeHidden(model: string): boolean;

	protected constructor(public type: FilterType, protected config: IFiltersConfig, protected store$: Store<any>) {

		/* initializeFilter */
		this.store$.pipe(
			select(selectOverlaysMap),
			withLatestFrom(this.store$.select(selectFilters)),
			tap(([overlays, caseFilters]) => this.initializeFilter(overlays, caseFilters))
		).subscribe();

		/* updateFilter */
		this.store$.select(selectFilters).pipe(
			map((filters: ICaseFilter[]) => filters.filter(({ type }) => type === FilterType.Enum)),
			filter(Boolean),
			tap((caseFilters: ICaseFilter<CaseEnumFilterMetadata>[]) => {
				this.updateFilters(caseFilters);
			})
		).subscribe();

		/* CalculateCounts */
		this.store$.select(selectFilteredOveralys).pipe(
			withLatestFrom(selectOverlaysMap),
			tap(this.calculateCounts.bind(this))
		).subscribe();
	}

	filteredCount() {
		return Object.keys(this.models).reduce((num, model: string) => {
			return this.isFiltered(model) ? num + 1 : num;
		}, 0);
	}

	calculateCounts([filteredOverlays, overlays]: [string[], Map<string, IOverlay>]) {
		Object.keys(this.models).forEach((model) => {
			this.resetFilteredCount(model);
			filteredOverlays.forEach((id: string) => {
				const overlay = overlays.get(id);
				this.incrementFilteredCount(model, overlay[model]);
			});
			// if (metadata instanceof EnumFilterMetadata || metadata instanceof BooleanFilterMetadata) {
			// 	FiltersService.calculatePotentialOverlaysCount(model, metadata, overlays, favoriteOverlays, removedOverlaysIds, removedOverlaysVisibility, filterState);
			// }
		});
	}
}

