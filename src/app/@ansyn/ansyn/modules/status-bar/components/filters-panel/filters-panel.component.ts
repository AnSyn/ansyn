import { Component, ElementRef, Inject, OnDestroy, OnInit } from '@angular/core';
import {
	IFiltersState,
	selectEnableOnlyFavorites,
	selectFacets,
	selectFiltersMetadata,
	selectShowOnlyFavorites
} from '../../../filters/reducer/filters.reducer';
import { select, Store } from '@ngrx/store';
import { LogOpenFilterPopup, UpdateFacetsAction } from '../../../filters/actions/filters.actions';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { filter, tap, withLatestFrom } from 'rxjs/operators';
import { ClickOutsideService } from '../../../core/click-outside/click-outside.service';
import { EnumFilterMetadata } from '../../../filters/models/metadata/enum-filter-metadata';
import { IFilter } from '../../../filters/models/IFilter';
import { FilterMetadata } from '../../../filters/models/metadata/filter-metadata.interface';
import { ICaseEnumFilterMetadata, ICaseFacetsState, ICaseFilter } from '../../../menu-items/cases/models/case.model';
import { StatusBarConfig } from '../../models/statusBar.config';
import { IFilterStatusBar, IStatusBarConfig } from '../../models/statusBar-config.model';
import { filtersConfig } from '../../../filters/services/filters.service';
import { IFiltersConfig } from '../../../filters/models/filters-config';

@Component({
	selector: 'ansyn-filters-panel',
	templateUrl: './filters-panel.component.html',
	styleUrls: ['./filters-panel.component.less']
})
@AutoSubscriptions()
export class FiltersPanelComponent implements OnInit, OnDestroy {
	MORE_FILTERS = 'MORE_FILTERS';
	expand: {[filterName: string]: boolean} = {};
	filtersMap: {[filterName: string]: {active: boolean, title: string}} = {};
	onlyFavorite: boolean;
	disableOnlyFavoritesButton: boolean;
	selectFiltersMetadata$ = this.store.pipe(select(selectFiltersMetadata));

	@AutoSubscription
	onlyFavorite$ = this.store.select(selectShowOnlyFavorites).pipe(
		tap( onlyFavorite => this.onlyFavorite = onlyFavorite)
	);

	@AutoSubscription
	isEnableFavorites$ = this.store.select(selectEnableOnlyFavorites).pipe(
		tap( enableFavorites => this.disableOnlyFavoritesButton = !enableFavorites)
	);

	@AutoSubscription
	resetFilterMapOnMetadateEmpty$ = this.selectFiltersMetadata$.pipe(
		filter( filters => !filters || filters.size === 0),
		tap( () => this.filtersMap = {})
	);

	@AutoSubscription
	updateFilters$ = this.selectFiltersMetadata$.pipe(
		filter(filters => filters && filters.size > 0 ),
		withLatestFrom(this.store.select(selectFacets)),
		tap(([filters, facets]: [Map<IFilter, FilterMetadata>, ICaseFacetsState]) => {
			filters.forEach( (metadata: FilterMetadata, filter: IFilter ) => {
				let title = '';
				if ( metadata instanceof EnumFilterMetadata) {
					const facetFilter: ICaseFilter = facets.filters.find( f => f.fieldName === filter.modelName);
					const facetMetadata: ICaseEnumFilterMetadata = facetFilter && <ICaseEnumFilterMetadata>facetFilter.metadata;
					const all = metadata.enumsFields.size;
					const unChecked = facetMetadata && facetMetadata.unCheckedEnums && facetMetadata.unCheckedEnums.filter( filteredName => metadata.enumsFields.has(filteredName)).length;
					title = unChecked === 0 ? '' : `${all - unChecked}/${all}`;
				}
				this.filtersMap[filter.modelName] = {
					active: metadata.isFiltered(),
					title: title
				}
			})
		})
	);

	@AutoSubscription
	isClickOutside$ = this.clickOutside.onClickOutside({monitor: this.element.nativeElement}).pipe(
		filter(clickOutside => clickOutside && this.isSomeFilterExpand()),
		tap( this.closeAllFilter.bind(this))
	);

	get config(): IFilterStatusBar {
		return this.statusBarConfig.filters;
	}

	get filters(): IFilter[] {
		return this.config.filterNames.map( filterName => this.filtersConfig.filters.find( filter => filterName === filter.modelName));
	}

	constructor(
		@Inject(StatusBarConfig) public statusBarConfig: IStatusBarConfig,
		@Inject(filtersConfig) public filtersConfig: IFiltersConfig,
		public store: Store<IFiltersState>,
		protected element: ElementRef,
		protected clickOutside: ClickOutsideService
	) {
		if (this.filters.length > this.config.maximumOpen) {
			this.expand[this.filters[0].modelName] = false;
			this.expand[this.filters[1].modelName] = false;
			this.expand[this.MORE_FILTERS] = false;
		}
		else {
			this.filters.forEach( filter => this.expand[filter.modelName] = false);
		}
	}

	ngOnInit() {
	}

	ngOnDestroy(): void {
	}

	showOnlyFavorites(closeFilter = true) {
		if (closeFilter) {
			this.closeAllFilter();
		}
		this.store.dispatch(new UpdateFacetsAction({ showOnlyFavorites: !this.onlyFavorite }));
	}

	isFilter(filter) {
		return this.filtersMap[filter] && this.filtersMap[filter].active || false;
	}

	expandFilter(filterName?) {
		const newState = !this.expand[filterName];
		if (filterName && newState) {
			this.store.dispatch(new LogOpenFilterPopup({ filterName }));
		}
		this.filters.forEach( filter => this.expand[filter.modelName] = false);
		this.expand[this.MORE_FILTERS] = false;
		if (filterName) {
			this.expand[filterName] = newState;
		}
	}

	isSomeFilterExpand() {
		return Object.values(this.expand).some(Boolean);
	}

	private closeAllFilter() {
		this.expandFilter();
	}

	getFilterTooltip(filterName: string) {
		return `Filter by ${filterName}`;
	}
}
