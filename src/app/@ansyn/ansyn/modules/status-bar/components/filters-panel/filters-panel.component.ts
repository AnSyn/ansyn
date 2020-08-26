import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import {
	IFiltersState, selectEnableOnlyFavorites,
	selectFacets,
	selectFilters,
	selectShowOnlyFavorites
} from '../../../filters/reducer/filters.reducer';
import { Store } from '@ngrx/store';
import { UpdateFacetsAction } from '../../../filters/actions/filters.actions';
import { AutoSubscriptions, AutoSubscription } from 'auto-subscriptions';
import { tap, filter, withLatestFrom } from 'rxjs/operators';
import { ClickOutsideService } from '../../../core/click-outside/click-outside.service';
import { EnumFilterMetadata } from '../../../filters/models/metadata/enum-filter-metadata';
import { IFilter } from '../../../filters/models/IFilter';
import { FilterMetadata } from '../../../filters/models/metadata/filter-metadata.interface';
import {
	ICaseEnumFilterMetadata,
	ICaseFacetsState,
	ICaseFilter
} from '../../../menu-items/cases/models/case.model';
import { StatusBarConfig } from '../../models/statusBar.config';
import { IFilterStatusBar, IStatusBarConfig } from '../../models/statusBar-config.model';
import { filtersConfig } from '../../../filters/services/filters.service';
import { IFiltersConfig } from '../../../filters/models/filters-config';
import { LoggerService } from '../../../core/services/logger.service';

@Component({
	selector: 'ansyn-filters-panel',
	templateUrl: './filters-panel.component.html',
	styleUrls: ['./filters-panel.component.less'],
	providers: [ClickOutsideService]
})
@AutoSubscriptions()
export class FiltersPanelComponent implements OnInit, OnDestroy {
	MORE_FILTERS = 'MORE_FILTERS';
	expand: {[filter: string]: boolean} = {};
	filtersMap: {[filter: string]: {active: boolean, title: string}} = {};
	onlyFavorite: boolean;
	disableOnlyFavoritesButton: boolean;

	@AutoSubscription
	onlyFavorite$ = this.store.select(selectShowOnlyFavorites).pipe(
		tap( onlyFavorite => this.onlyFavorite = onlyFavorite)
	);

	@AutoSubscription
	isEnableFavorites$ = this.store.select(selectEnableOnlyFavorites).pipe(
		tap( enableFavorites => this.disableOnlyFavoritesButton = !enableFavorites)
	);

	@AutoSubscription
	updateFilters$ = this.store.select(selectFilters).pipe(
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
	isClickOutside$ = this.clickOutside.onClickOutside().pipe(
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
		protected clickOutside: ClickOutsideService,
		protected loggerService: LoggerService
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

	expandFilter(filter?) {
		const newState = !this.expand[filter];
		this.loggerService.info(`Filters panel: ${newState ? 'opening' : 'closing'} ${filter} popup`, 'Search panel', 'SEARCH_PANEL_TOGGLE_POPUP');
		this.filters.forEach( filter => this.expand[filter.modelName] = false);
		this.expand[this.MORE_FILTERS] = false;
		if (filter) {
			this.expand[filter] = newState;
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
