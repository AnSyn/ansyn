import { FiltersService } from '../../services/filters.service';
import { Component, OnDestroy } from '@angular/core';
import { Filter } from '../../models/filter';
import { Store } from '@ngrx/store';
import { filtersStateSelector, IFiltersState } from '../../reducer/filters.reducer';
import { UpdateFacetsAction } from '../../actions/filters.actions';

@Component({
	selector: 'ansyn-filters',
	templateUrl: './filters-collection.component.html',
	styleUrls: ['./filters-collection.component.less']
})

export class FiltersCollectionComponent implements OnDestroy {
	public disableShowOnlyFavoritesSelection: boolean;
	public onlyFavorite: boolean;
	public filters: Filter[] = this.filtersService.getFilters();

	public subscribers = {
		filters: undefined
	} as any;

	constructor(protected filtersService: FiltersService, public store: Store<IFiltersState>) {
		this.subscribers.filters = this.store.select(filtersStateSelector)
			.distinctUntilChanged()
			.map((state: IFiltersState) => {
				return {
					showOnlyFavorites: state.facets.showOnlyFavorites,
					enableOnlyFavoritesSelection: state.enableOnlyFavoritesSelection
				};
			})
			.subscribe(result => {
				// don't let the checkbox to be disabled if it is checked;
				// onlyFavorite is true after ToggleOnlyFavoriteAction;
				// enableOnlyFavoritesSelection is true when there are favorites in the system
				// there is a situation where enableOnlyFavoritesSelection is false but the input is checked
				// and therefore can never be unchecked
				this.onlyFavorite = result.showOnlyFavorites;
				if (this.onlyFavorite && !result.enableOnlyFavoritesSelection) {
					return;
				}

				this.disableShowOnlyFavoritesSelection = !result.enableOnlyFavoritesSelection;
			});

	}

	showOnlyFavorites($event) {
		this.store.dispatch(new UpdateFacetsAction({ showOnlyFavorites: !this.onlyFavorite }));
	}

	ngOnDestroy() {
		Object.keys(this.subscribers).forEach((s) => this.subscribers[s].unsubscribe());
	}

}
