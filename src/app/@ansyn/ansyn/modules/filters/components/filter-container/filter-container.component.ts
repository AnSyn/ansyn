import { UpdateFilterAction } from '../../actions/filters.actions';
import { select, Store } from '@ngrx/store';
import {
	FiltersMetadata, FiltersCounters,
	IFiltersState,
	selectFiltersMetadata, selectFiltersCounters,
	selectFiltersSearchResults,
	selectIsLoading,
	selectShowOnlyFavorites
} from '../../reducer/filters.reducer';
import { Observable } from 'rxjs';
import { FilterMetadata } from '../../models/metadata/filter-metadata.interface';
import { Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { clone } from 'lodash';
import { EnumFilterMetadata } from '../../models/metadata/enum-filter-metadata';
import { filtersConfig } from '../../services/filters.service';
import { IFiltersConfig } from '../../models/filters-config';
import { filter, map, tap } from 'rxjs/operators';
import { FilterType } from '../../models/filter-type';
import { FilterCounters } from '../../models/counters/filter-counters.interface';

@Component({
	selector: 'ansyn-filter-container',
	templateUrl: './filter-container.component.html',
	styleUrls: ['./filter-container.component.less'],
	animations: [
		trigger('fieldsTrigger', [
			state('true', style({
				maxHeight: '300px',
				opacity: 1
			})),
			state('false', style({
				maxHeight: '0',
				opacity: 0
			})),
			transition('1 <=> 0', animate('0.2s'))
		])
	]
})
export class FilterContainerComponent implements OnInit, OnDestroy {

	public isLongFiltersList = false;
	public showOnlyFavorite = false;
	public isGotSmallListFromProvider = true;
	public metadataFromState: FilterMetadata;
	public filterCountersFromState: FilterCounters;
	subscribers = [];
	filtersSearchResults = {};

	@Input() filter;

	public isLoading$: Observable<boolean> = this.store.select(selectIsLoading);

	filterSearchResults$: Observable<any> = this.store.pipe(
		select(selectFiltersSearchResults),
		tap((filtersSearchResults) => this.filtersSearchResults = filtersSearchResults)
	);

	metadataFromState$: Observable<any> = this.store.select(selectFiltersMetadata).pipe(
		map((filters: FiltersMetadata) => filters.get(this.filter)),
		tap((metadata: FilterMetadata) => {
			this.metadataFromState = metadata;
		})
	);

	filterCountersFromState$: Observable<any> = this.store.select(selectFiltersCounters).pipe(
		map((allCounters: FiltersCounters) => allCounters.get(this.filter)),
		tap((counters: FilterCounters) => {
			this.filterCountersFromState = counters;
		})
	);

	isGotSmallListFromProvider$ = this.metadataFromState$.pipe(
		filter((metadata) => this.filter.type === FilterType.Enum && Boolean(metadata)),
		tap((metadata) => {
			this.isGotSmallListFromProvider = (<EnumFilterMetadata>metadata).enumsFields.size <= this.config.shortFilterListLength;
		})
	);


	showOnlyFavorites$: Observable<any> = this.store.select(selectShowOnlyFavorites).pipe(
		tap((showOnlyFavorites) => {
			this.showOnlyFavorite = showOnlyFavorites;
			this.isLongFiltersList = false;
		})
	);

	constructor(protected store: Store<IFiltersState>, @Inject(filtersConfig) protected config: IFiltersConfig) {
	}

	get disabledShowAll() {
		return !this.metadataFromState || this.showOnlyFavorite;
	}

	ngOnInit() {
		this.subscribers.push(
			this.metadataFromState$.subscribe(),
			this.filterCountersFromState$.subscribe(),
			this.isGotSmallListFromProvider$.subscribe(),
			this.showOnlyFavorites$.subscribe(),
			this.filterSearchResults$.subscribe()
		);
	}

	ngOnDestroy() {
		this.subscribers.forEach(sub => sub.unsubscribe());
	}

	onMetadataChange(metadata: any): void {
		this.store.dispatch(new UpdateFilterAction({ filter: this.filter, newMetadata: clone(metadata) }));
	}

	showAll(): void {
		if (this.metadataFromState) {
			this.metadataFromState.showAll();
			this.onMetadataChange(this.metadataFromState);
		}
	}

	toggleShowMoreLess(): void {
		this.isLongFiltersList = !this.isLongFiltersList;
	}

	toggleVisible(): void {
		const newMetadata = clone(this.metadataFromState);
		newMetadata.collapse = !newMetadata.collapse;
		this.store.dispatch(new UpdateFilterAction({filter: this.filter, newMetadata}));
	}
}
