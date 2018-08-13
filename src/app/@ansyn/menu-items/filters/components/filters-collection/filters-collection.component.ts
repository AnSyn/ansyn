import { FiltersService } from '../../services/filters.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { IFilter } from '../../models/IFilter';
import { Store } from '@ngrx/store';
import { filtersStateSelector, IFiltersState } from '../../reducer/filters.reducer';
import { UpdateFacetsAction } from '../../actions/filters.actions';
import { selectRemovedOverlays, selectRemovedOverlaysVisibility } from '@ansyn/core/reducers/core.reducer';
import { distinctUntilChanged, filter, map } from 'rxjs/internal/operators';
import { RemovedOverlaysVisibilityAction } from '@ansyn/core/actions/core.actions';
import { IOverlay } from '@ansyn/core/models/overlay.model';
import { selectOverlaysArray } from '@ansyn/overlays/reducers/overlays.reducer';
import { selectSelectedCase } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { ICase } from '@ansyn/menu-items/cases/models/case.model';
import { Observable } from 'rxjs';


@Component({
	selector: 'ansyn-filters',
	templateUrl: './filters-collection.component.html',
	styleUrls: ['./filters-collection.component.less']
})

export class FiltersCollectionComponent implements OnDestroy, OnInit {
	public disableShowOnlyFavoritesSelection: boolean;
	public onlyFavorite: boolean;
	public filters: IFilter[] = this.filtersService.getFilters();
	removedOverlaysCount = 0;
	subscribers = [];
	removedOverlaysVisibility;
	removedOverlays$ = this.store.select(selectRemovedOverlays);
	selectedCase$ = this.store.select(selectSelectedCase);
	overlaysArray$ = this.store.select(selectOverlaysArray);
	countRemoveOverlays$: Observable<[string[], ICase, IOverlay[]]> = Observable.combineLatest(this.removedOverlays$, this.selectedCase$, this.overlaysArray$);

	removedOverlaysCount$ = this.countRemoveOverlays$.pipe(
		distinctUntilChanged(),
		filter(([removedOverlaysIds]: [string[], ICase, IOverlay[]]) => Boolean(removedOverlaysIds[0])),
		map(([removedOverlaysIds, _, overlays]: [string[], ICase, IOverlay[]]) => {
			return removedOverlaysIds.filter((removedId) => overlays.some((overlay) => overlay.id === removedId)).length;
		})
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
