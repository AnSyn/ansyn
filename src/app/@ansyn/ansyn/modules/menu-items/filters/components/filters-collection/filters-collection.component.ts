import { filtersConfig } from '../../services/filters.service';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { IFilter } from '../../models/IFilter';
import { Store } from '@ngrx/store';
import { filtersStateSelector, IFiltersState, selectFilters, selectFiltersSearch } from '../../reducer/filters.reducer';
import { setFilterSearch, UpdateFacetsAction } from '../../actions/filters.actions';
import { distinctUntilChanged, map, withLatestFrom } from 'rxjs/internal/operators';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { IFiltersConfig } from '../../models/filters-config';
import { FilterMetadata } from '../../models/metadata/filter-metadata.interface';
import { FilterType } from '../../models/filter-type';


@Component({
	selector: 'ansyn-filters',
	templateUrl: './filters-collection.component.html',
	styleUrls: ['./filters-collection.component.less']
})
@AutoSubscriptions({
	destroy: 'ngOnDestroy',
	init: 'ngOnInit'
})
export class FiltersCollectionComponent implements OnDestroy, OnInit {
	public disableShowOnlyFavoritesSelection: boolean;
	public onlyFavorite: boolean;
	public filters: IFilter[] = this.config.filters;
	public filtersSearch = '';

	@AutoSubscription
	filtersSearch$: any = this.store.select(selectFiltersSearch).pipe(
		withLatestFrom(this.store.select(selectFilters)),
		tap(([value, filtersMetadata]: [string, Map<IFilter, FilterMetadata>]): any => {
			this.filtersSearch = value;
			const lowerFiltersSearch = value.toLowerCase();
			this.filters = this.config.filters
				.filter((filterKey) => {
					const fields = [filterKey.displayName];
					const model: any = filtersMetadata.get(filterKey);
					if (model) {
						switch (filterKey.type) {
							case FilterType.Enum:
								fields.push(...Array.from(model.enumsFields.keys()) as string[]);
								break;
							case FilterType.Array:
								fields.push(...Array.from(model.fields.keys()) as string[]);
								break;
						}
					}
					return fields.some((value: string = '') => value.toLowerCase().includes(lowerFiltersSearch));
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
		this.store.dispatch(new UpdateFacetsAction({ showOnlyFavorites: !this.onlyFavorite }));
	}

	setFiltersSearch($event: string) {
		this.store.dispatch(setFilterSearch($event));
	}

	ngOnDestroy() {
	}

	ngOnInit(): void {
	}
}
