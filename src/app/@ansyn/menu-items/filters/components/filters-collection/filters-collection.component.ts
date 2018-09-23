import { FiltersService } from '../../services/filters.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { IFilter } from '../../models/IFilter';
import { Store } from '@ngrx/store';
import { filtersStateSelector, IFiltersState } from '../../reducer/filters.reducer';
import { UpdateFacetsAction } from '../../actions/filters.actions';
import { distinctUntilChanged, map } from 'rxjs/internal/operators';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';


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
	public filters: IFilter[] = this.filtersService.getFilters();


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


	constructor(protected filtersService: FiltersService, public store: Store<IFiltersState>) {
	}

	showOnlyFavorites($event) {
		this.store.dispatch(new UpdateFacetsAction({ showOnlyFavorites: !this.onlyFavorite }));
	}

	ngOnDestroy() {
	}

	ngOnInit(): void {
	}
}
