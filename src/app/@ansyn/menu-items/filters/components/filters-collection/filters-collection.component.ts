import { FiltersService } from '../../services/filters.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { IFilter } from '../../models/IFilter';
import { Store } from '@ngrx/store';
import { filtersStateSelector, IFiltersState } from '../../reducer/filters.reducer';
import { UpdateFacetsAction } from '../../actions/filters.actions';
import { selectRemovedOverlays, selectRemovedOverlaysVisibility } from '@ansyn/core/reducers/core.reducer';
import { distinctUntilChanged, map } from 'rxjs/internal/operators';
import { RemovedOverlaysVisibilityAction } from '@ansyn/core/actions/core.actions';
import { IOverlay } from '@ansyn/core/models/overlay.model';

@Component({
	selector: 'ansyn-filters',
	templateUrl: './filters-collection.component.html',
	styleUrls: ['./filters-collection.component.less']
})

export class FiltersCollectionComponent implements OnDestroy, OnInit {
	public disableShowOnlyFavoritesSelection: boolean;
	public onlyFavorite: boolean;
	public filters: IFilter[] = this.filtersService.getFilters();
	private removedOverlaysVisibility;
	private removedOverlaysCount = 0;
	subscribers = [];

	removedOverlaysCount$ = this.store.select(selectRemovedOverlays).pipe(
		distinctUntilChanged(),
		map((overlays: IOverlay[]) => overlays.length)
	);

	removedOverlaysVisibility$ = this.store.select(selectRemovedOverlaysVisibility);


	filters$ = this.store.select(filtersStateSelector).pipe(
		distinctUntilChanged(),
		map((state: IFiltersState) => {
			return {
				showOnlyFavorites: state.facets.showOnlyFavorites,
				enableOnlyFavoritesSelection: state.enableOnlyFavoritesSelection
			};
		})
	);


	constructor(protected filtersService: FiltersService, public store: Store<IFiltersState>) {
	}

	showOnlyFavorites($event) {
		this.store.dispatch(new UpdateFacetsAction({ showOnlyFavorites: !this.onlyFavorite }));
	}

	ngOnDestroy() {
		this.subscribers.forEach((sub) => sub.unsubscribe());
	}

	ngOnInit(): void {
		this.subscribers.push(
			this.filters$.subscribe(result => {
				this.onlyFavorite = result.showOnlyFavorites;
				if (this.onlyFavorite && !result.enableOnlyFavoritesSelection) {
					return;
				}

				this.disableShowOnlyFavoritesSelection = !result.enableOnlyFavoritesSelection;
			}),
			this.removedOverlaysVisibility$.subscribe((visibility) => {
				this.removedOverlaysVisibility = visibility;
			}),
			this.removedOverlaysCount$.subscribe((count) => {
					this.removedOverlaysCount = count;
				}
			)
		);
	}

	ShowRemoved() {
		this.store.dispatch(new RemovedOverlaysVisibilityAction(!this.removedOverlaysVisibility));
	}

}
