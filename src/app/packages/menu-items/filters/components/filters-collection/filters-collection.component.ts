import { FiltersService } from '../../services/filters.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { Filter } from '../../models/filter';
import { Store } from '@ngrx/store';
import { IFiltersState } from '../../reducer/filters.reducer';
import { ToggleOnlyFavoriteAction } from '../../actions/filters.actions';
import { FiltersEffects } from '../../effects/filters.effects';
import { DestroySubscribers } from 'ng2-destroy-subscribers';

@Component({
	selector: 'ansyn-filters',
	templateUrl: './filters-collection.component.html',
	styleUrls: ['./filters-collection.component.less']
})
@DestroySubscribers({
	destroyFunc: 'ngOnDestroy',
})
export class FiltersCollectionComponent implements OnDestroy {
	public disableShowOnlyFavoritesSelection: boolean;
	public onlyFavorite: boolean;
	public filters: any[];

	public subscribers = {
		filters: undefined
	} as any;

	initialFilters$: Observable<Filter[]> = this.filtersService.loadFilters();

	constructor(private filtersService: FiltersService, public store: Store<IFiltersState>) {
		this.subscribers.filters =  this.store.select('filters').subscribe((result: IFiltersState) => {
			// don't let the checkbox to be disabled if it is checked;
			// onlyFavorite is true after ToggleOnlyFavoriteAction;
			// enableOnlyFavoritesSelection is true when there are favorites in the system
			// there is a situation where enableOnlyFavoritesSelection is false but the input is checked
			// and therefore can never be unchecked
			this.onlyFavorite = result.showOnlyFavorites;
			if(this.onlyFavorite && !result.enableOnlyFavoritesSelection){
				return;
			}

			this.disableShowOnlyFavoritesSelection = !result.enableOnlyFavoritesSelection;
		});

		this.subscribers.intialFilters = this.initialFilters$.subscribe(filters => {
			this.filters = filters;
		});
	}

	showOnlyFavorites(data) {
		this.store.dispatch(new ToggleOnlyFavoriteAction());
	}

	ngOnDestroy(){

	}

}
