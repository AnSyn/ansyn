import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { filtersConfig } from '../../../menu-items/filters/services/filters.service';
import { IFiltersConfig } from '../../../menu-items/filters/models/filters-config';
import { IFiltersState, selectShowOnlyFavorites } from '../../../menu-items/filters/reducer/filters.reducer';
import { Store } from '@ngrx/store';
import { UpdateFacetsAction } from '../../../menu-items/filters/actions/filters.actions';
import { AutoSubscriptions, AutoSubscription } from 'auto-subscriptions';
import { tap } from 'rxjs/operators';

@Component({
	selector: 'ansyn-filters-panel',
	templateUrl: './filters-panel.component.html',
	styleUrls: ['./filters-panel.component.less']
})
@AutoSubscriptions()
export class FiltersPanelComponent implements OnInit, OnDestroy {

	expand: {[filter: string]: boolean} = {};
	onlyFavorite: boolean;

	@AutoSubscription
	onlyFavorite$ = this.store.select(selectShowOnlyFavorites).pipe(
		tap( onlyFavorite => this.onlyFavorite = onlyFavorite)
	);
	constructor(@Inject(filtersConfig) public filterConfig: IFiltersConfig,
				public store: Store<IFiltersState>) {
		this.filterConfig.filters.forEach( filter => this.expand[filter.modelName] = false);
	}

	ngOnInit() {
	}

	ngOnDestroy(): void {
	}

	showOnlyFavorites() {
		this.expandFilter('favorite');
		this.store.dispatch(new UpdateFacetsAction({ showOnlyFavorites: !this.onlyFavorite }));
	}

	expandFilter(filter) {
		const newState = !this.expand[filter];
		this.filterConfig.filters.forEach( filter => this.expand[filter.modelName] = false)
		this.expand[filter] = newState;
	}

}
