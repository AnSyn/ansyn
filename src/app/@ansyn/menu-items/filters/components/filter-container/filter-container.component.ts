import { Store } from '@ngrx/store';
import { IFiltersState, selectIsLoading, selectShowOnlyFavorites } from '../../reducer/filters.reducer';
import { Observable } from 'rxjs';
import { FilterMetadata } from '../../models/metadata/filter-metadata.interface';
import { Component, ElementRef, Inject, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { FilterType } from '@ansyn/core';
import { EnumFilterMetadata } from '../../models/metadata/enum-filter-metadata';
import { filtersConfig } from '../../services/filters.service';
import { IFiltersConfig } from '../../models/filters-config';
import { tap } from 'rxjs/operators';
import { IFilter } from '../../models/IFilter';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';

@Component({
	selector: 'ansyn-filter-container',
	templateUrl: './filter-container.component.html',
	styleUrls: ['./filter-container.component.less'],
	animations: [
		trigger('rotateArrow', [
			state('true', style({
				transform: 'rotateZ(-45deg) translateY(35%) translateX(50%)'
			})),
			state('false', style({
				transform: 'rotateZ(135deg) translateY(-75%)'
			})),
			transition('1 <=> 0', animate('0.1s'))
		]),
		trigger('fieldsTrigger', [
			state('true', style({
				maxHeight: '5000px',
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
@AutoSubscriptions({
	init: 'ngOnInit',
	destroy: 'ngOnDestroy'
})
export class FilterContainerComponent implements OnInit, OnDestroy {
	protected _filter: IFilter;
	public metadataFromState: FilterMetadata;
	public isGotSmallListFromProvider;

	@Input()
	set filter(value: IFilter) {
		this._filter = value;
		this.metadataFromState = this.filterMetadata.find((filterMetadata: FilterMetadata) => {
			return filterMetadata.type === this.filter.type
		});
		this.isGotSmallListFromProvider = this.filter.type === FilterType.Enum ?
			(<EnumFilterMetadata> this.metadataFromState).models[this.filter.modelName].size <= this.config.shortFilterListLength : true;

	}

	get filter() {
		return this._filter;
	}

	public show = true;
	public isLongFiltersList = false;
	public showOnlyFavorite = false;
	@ViewChild('fields') fields: ElementRef;
	public isLoading$: Observable<boolean> = this.store.select(selectIsLoading);

	@AutoSubscription
	showOnlyFavorites$: Observable<any> = this.store.select(selectShowOnlyFavorites).pipe(
		tap((showOnlyFavorites) => {
			this.showOnlyFavorite = showOnlyFavorites;
			this.isLongFiltersList = false;
		})
	);

	constructor(protected store: Store<IFiltersState>,
				@Inject(filtersConfig) protected config: IFiltersConfig,
				@Inject(FilterMetadata) protected filterMetadata: FilterMetadata[]) {
	}

	get disabledShowAll() {
		return !this.metadataFromState || this.showOnlyFavorite;
	}

	ngOnInit() {
	}

	ngOnDestroy() {
	}

	onMetadataChange(metadata: any): void {
		// this.store.dispatch(new UpdateFilterAction({ filter: this.filter, newMetadata: clone(metadata) }));
	}

	showAll(): void {
		if (this.metadataFromState) {
			// const clonedMetadata: FilterMetadata = Object.assign(Object.create(this.metadataFromState), this.metadataFromState);
			this.metadataFromState.showAll(this.filter.modelName);
			this.onMetadataChange(this.metadataFromState);
		}
	}

	toggleShowMoreLess(): void {
		this.isLongFiltersList = !this.isLongFiltersList;
	}
}
