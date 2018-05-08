import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { IAppState } from '../app.effects.module';
import {
	Filters,
	selectFilters,
	selectShowOnlyFavorite
} from '@ansyn/menu-items/filters/reducer/filters.reducer';
import {
	LoadOverlaysAction,
	LoadOverlaysSuccessAction,
	OverlaysActionTypes, SetFilteredOverlaysAction, SetOverlaysStatusMessage
} from '@ansyn/overlays/actions/overlays.actions';
import {
	IOverlaysState, overlaysStateSelector, overlaysStatusMessages,
	selectOverlaysArray
} from '@ansyn/overlays/reducers/overlays.reducer';
import {
	EnableOnlyFavoritesSelectionAction,
	InitializeFiltersAction,
	ResetFiltersAction
} from '@ansyn/menu-items/filters/actions/filters.actions';
import 'rxjs/add/operator/share';
import 'rxjs/add/observable/of';
import { casesStateSelector } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { EnumFilterMetadata } from '@ansyn/menu-items/filters/models/metadata/enum-filter-metadata';
import { SliderFilterMetadata } from '@ansyn/menu-items/filters/models/metadata/slider-filter-metadata';
import { SetBadgeAction } from '@ansyn/menu/actions/menu.actions';
import { CoreActionTypes, SetFavoriteOverlaysAction } from '@ansyn/core/actions/core.actions';
import { selectFavoriteOverlays } from '@ansyn/core/reducers/core.reducer';
import { BooleanFilterMetadata } from '@ansyn/menu-items/filters/models/metadata/boolean-filter-metadata';
import { Case, CaseFacetsState } from '@ansyn/core/models/case.model';
import { Overlay } from '@ansyn/core/models/overlay.model';
import { FilterMetadata } from '@ansyn/menu-items/filters/models/metadata/filter-metadata.interface';
import { FiltersService } from '@ansyn/menu-items/filters/services/filters.service';
import { FilterModel } from '@ansyn/core/models/filter.model';
import { OverlaysService } from '@ansyn/overlays/services/overlays.service';

@Injectable()
export class FiltersAppEffects {

	filters$ = this.store$.select(selectFilters);
	showOnlyFavorite$ = this.store$.select(selectShowOnlyFavorite);
	favoriteOverlays$ = this.store$.select(selectFavoriteOverlays);
	overlaysArray$ = this.store$.select(selectOverlaysArray);
	onFiltersChanges$ = Observable.combineLatest(this.filters$, this.showOnlyFavorite$);

	/**
	 * @type Effect
	 * @name updateOverlayFilters$
	 * @ofType onFiltersChanges$
	 * @action SyncOverlaysWithFavoritesAfterLoadedAction, SetFilteredOverlaysAction
	 * @filter overlays are loaded
	 * @dependencies filters, core, overlays
	 */
	@Effect()
	updateOverlayFilters$ = this.onFiltersChanges$
		.withLatestFrom(this.favoriteOverlays$, this.overlaysArray$)
		.mergeMap(([[filters, showOnlyFavorite], favoriteOverlays, overlaysArray]: [[Filters, boolean], Overlay[], Overlay[]]) => {
			const filterModels: FilterModel[] = FiltersService.pluckFilterModels(filters);
			const filteredOverlays: string[] = OverlaysService.buildFilteredOverlays(overlaysArray, filterModels, favoriteOverlays, showOnlyFavorite);
			const message = (filteredOverlays && filteredOverlays.length) ? overlaysStatusMessages.nullify : overlaysStatusMessages.noOverLayMatchFilters;
			return [
				new SetFilteredOverlaysAction(filteredOverlays),
				new SetOverlaysStatusMessage(message)
			];
		});


	/**
	 * @type Effect
	 * @name initializeFilters$
	 * @ofType LoadOverlaysSuccessAction
	 * @dependencies cases, overlays
	 * @action InitializeFiltersAction
	 */
	@Effect()
	initializeFilters$: Observable<any> = this.actions$
		.ofType<LoadOverlaysSuccessAction>(OverlaysActionTypes.LOAD_OVERLAYS_SUCCESS)
		.withLatestFrom(this.store$.select(casesStateSelector).pluck('selectedCase'), this.store$.select(overlaysStateSelector), (action: any, selectedCase: Case, overlaysState: IOverlaysState): any => {
			const overlaysArray: Overlay[] = Array.from(overlaysState.overlays.values());
			return [overlaysArray, selectedCase.state.facets];
		})
		.map(([overlays, facets]: [Overlay[], CaseFacetsState]) => new InitializeFiltersAction({ overlays, facets }));

	/**
	 * @type Effect
	 * @name resetFilters$
	 * @ofType LoadOverlaysAction
	 * @action ResetFiltersAction
	 */
	@Effect()
	resetFilters$: Observable<ResetFiltersAction> = this.actions$
		.ofType<LoadOverlaysAction>(OverlaysActionTypes.LOAD_OVERLAYS)
		.map(() => new ResetFiltersAction());


	/**
	 * @type Effect
	 * @name updateFiltersBadge$
	 * @ofType InitializeFiltersSuccessAction, UpdateFilterAction, ToggleOnlyFavoriteAction
	 * @dependencies filters
	 * @action SetBadgeAction
	 */
	@Effect()
	updateFiltersBadge$: Observable<any> = this.onFiltersChanges$
		.map(([ filters, showOnlyFavorites ]: [Filters, boolean]) => {
			let badge = '0';

			if (showOnlyFavorites) {
				badge = '★';
			} else {
				const enumFilterValues = Array.from(filters.values());

				badge = enumFilterValues.reduce((badgeNum: number, filterMetadata: FilterMetadata) => {
					switch (filterMetadata.constructor) {
						case EnumFilterMetadata:
							const someUnchecked = Array.from((<EnumFilterMetadata>filterMetadata).enumsFields.values()).some(({ isChecked }) => !isChecked);
							return someUnchecked ? badgeNum + 1 : badgeNum;
						case SliderFilterMetadata:
							const someNotInfinity = (<SliderFilterMetadata>filterMetadata).start !== -Infinity || (<SliderFilterMetadata>filterMetadata).end !== Infinity;
							return someNotInfinity ? badgeNum + 1 : badgeNum;
						case BooleanFilterMetadata: {
							const someUnchecked = !(<BooleanFilterMetadata>filterMetadata).trueProperties.value || !(<BooleanFilterMetadata>filterMetadata).falseProperties.value;
							return someUnchecked ? badgeNum + 1 : badgeNum;
						}
						default:
							return badgeNum;
					}
				}, 0).toString();
			}

			return new SetBadgeAction({ key: 'Filters', badge });
		})
		.share();

	/**
	 * @type Effect
	 * @name setShowFavoritesFlagOnFilters$
	 * @ofType SetFavoriteOverlaysAction
	 * @action EnableOnlyFavoritesSelectionAction
	 */
	@Effect()
	setShowFavoritesFlagOnFilters$: Observable<any> = this.favoriteOverlays$
		.map((favoriteOverlays: Overlay[]) => new EnableOnlyFavoritesSelectionAction(Boolean(favoriteOverlays.length)));

	constructor(protected actions$: Actions, protected store$: Store<IAppState>) {
	}
}
