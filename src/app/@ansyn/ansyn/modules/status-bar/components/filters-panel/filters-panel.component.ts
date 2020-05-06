import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { filtersConfig } from '../../../filters/services/filters.service';
import { IFiltersConfig } from '../../../filters/models/filters-config';
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

@Component({
	selector: 'ansyn-filters-panel',
	templateUrl: './filters-panel.component.html',
	styleUrls: ['./filters-panel.component.less'],
	providers: [ClickOutsideService]
})
@AutoSubscriptions()
export class FiltersPanelComponent implements OnInit, OnDestroy {

	expand: {[filter: string]: boolean} = {};
	filters: {[filter: string]: {active: boolean, title: string}} = {};
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
					const unChecked = facetMetadata.unCheckedEnums && facetMetadata.unCheckedEnums.filter( filteredName => metadata.enumsFields.has(filteredName)).length;
					title = unChecked === 0 ? '' : `${all - unChecked}/${all}`;
				}
				this.filters[filter.modelName] = {
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

	constructor(@Inject(filtersConfig) public filterConfig: IFiltersConfig,
				public store: Store<IFiltersState>,
				protected clickOutside: ClickOutsideService) {
		this.filterConfig.filters.forEach( filter => this.expand[filter.modelName] = false);
	}

	ngOnInit() {
	}

	ngOnDestroy(): void {
	}

	showOnlyFavorites() {
		this.closeAllFilter();
		this.store.dispatch(new UpdateFacetsAction({ showOnlyFavorites: !this.onlyFavorite }));
	}

	isFilter(filter) {
		return this.filters[filter] && this.filters[filter].active || false;
	}

	expandFilter(filter?) {
		const newState = !this.expand[filter];
		this.filterConfig.filters.forEach( filter => this.expand[filter.modelName] = false);
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
