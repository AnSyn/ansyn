import { filtersConfig } from '../../services/filters.service';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { IFilter } from '../../models/IFilter';
import { select, Store } from '@ngrx/store';
import {
	filtersStateSelector,
	IFiltersState,
	selectFiltersSearch,
	selectFiltersSearchResults
} from '../../reducer/filters.reducer';
import { SetFilterSearch, UpdateFacetsAction } from '../../actions/filters.actions';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { distinctUntilChanged, map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { IFiltersConfig } from '../../models/filters-config';
import { IFilterSearchResults } from '../../models/filter-search-results';

@Component({
	selector: 'ansyn-filters',
	templateUrl: './filters-collection.component.html',
	styleUrls: ['./filters-collection.component.less']
})
@AutoSubscriptions()
export class FiltersCollectionComponent implements OnDestroy, OnInit {
	public disableShowOnlyFavoritesSelection: boolean;
	public onlyFavorite: boolean;
	public filters: IFilter[] = this.config.filters;
	filtersSearch$: any = this.store.select(selectFiltersSearch);

	@AutoSubscription
	filtersSearchResults$: any = this.store.pipe(
		select(selectFiltersSearchResults),
		tap((filtersSearchResults: IFilterSearchResults): any => {
			this.filters = this.config.filters.filter((key) => {
				const { [key.displayName]: filtersSearchResult } = filtersSearchResults;
				return filtersSearchResult === 'all' || (Array.isArray(filtersSearchResult) && filtersSearchResult.length);
			});
		})
	);

	@AutoSubscription
	filters$: Observable<any> = this.store.select(filtersStateSelector).pipe(
		distinctUntilChanged(),
		map((state: IFiltersState) => {
			return {
				showOnlyFavorites: state.facets.showOnlyFavorites,
				enableOnlyFavoritesSelection: state.enableOnlyFavoritesSelection
			};
		}),
		tap((result) => {
			this.onlyFavorite = result.showOnlyFavorites;
			if (this.onlyFavorite && !result.enableOnlyFavoritesSelection) {
				return;
			}

			this.disableShowOnlyFavoritesSelection = !result.enableOnlyFavoritesSelection;
		})
	);


	constructor(@Inject(filtersConfig) protected config: IFiltersConfig, public store: Store<IFiltersState>) {
	}

	showOnlyFavorites($event) {
		this.store.dispatch(UpdateFacetsAction({ showOnlyFavorites: !this.onlyFavorite }));
	}

	setFiltersSearch($event: string) {
		this.store.dispatch(SetFilterSearch({payload: $event}));
	}

	ngOnDestroy() {
	}

	ngOnInit(): void {
	}
}
