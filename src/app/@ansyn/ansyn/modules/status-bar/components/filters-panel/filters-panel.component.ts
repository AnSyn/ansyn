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
import { tap, filter } from 'rxjs/operators';
import { ICaseFacetsState } from '../../../menu-items/cases/models/case.model';
import { ClickOutsideService } from '../../../core/click-outside/click-outside.service';

@Component({
	selector: 'ansyn-filters-panel',
	templateUrl: './filters-panel.component.html',
	styleUrls: ['./filters-panel.component.less'],
	providers: [ClickOutsideService]
})
@AutoSubscriptions()
export class FiltersPanelComponent implements OnInit, OnDestroy {

	expand: {[filter: string]: boolean} = {};
	filtered: {[filter: string]: boolean} = {};
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
	selectFacets = this.store.select(selectFacets).pipe(
		filter((facets: ICaseFacetsState) => facets.filters.length > 0),
		tap(facets => {
			facets.filters.forEach( (filter: any) => {
				this.filtered[filter.fieldName] = filter.metadata.unCheckedEnums && filter.metadata.unCheckedEnums.length > 0
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
}
