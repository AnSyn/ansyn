import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { MenuActionTypes, UnSelectMenuItemAction } from '@ansyn/menu';
import { UpdateMapSizeAction } from '@ansyn/map-facade';
import { RedrawTimelineAction } from '@ansyn/overlays';
import 'rxjs/add/operator/withLatestFrom';
import { GoToExpandAction, SetAutoCloseMenu, ToolsActionsTypes } from '@ansyn/menu-items/tools/actions/tools.actions';
import { SetBadgeAction, SetClickOutside } from '@ansyn/menu/actions/menu.actions';
import { EnumFilterMetadata } from '@ansyn/menu-items/filters/models/metadata/enum-filter-metadata';
import { filtersStateSelector, IFiltersState } from '@ansyn/menu-items/filters/reducer/filters.reducer';
import { facetChangesActionType } from '@ansyn/menu-items/filters/effects/filters.effects';
import { IAppState } from '../app.effects.module';
import { Action, Store } from '@ngrx/store';

@Injectable()
export class MenuAppEffects {

	/**
	 * @type Effect
	 * @name onContainerChanged$
	 * @ofType ContainerChangedTriggerAction
	 * @action UpdateMapSizeAction, RedrawTimelineAction
	 */
	@Effect()
	onContainerChanged$: Observable<UpdateMapSizeAction> = this.actions$
		.ofType(MenuActionTypes.TRIGGER.CONTAINER_CHANGED)
		.mergeMap(() => [
			new UpdateMapSizeAction(),
			new RedrawTimelineAction(true)
		]);

	/**
	 * @type Effect
	 * @name onGoToExpand$
	 * @ofType GoToExpandAction
	 * @action SetClickOutside
	 */
	@Effect()
	onGoToExpand$: Observable<SetClickOutside> = this.actions$
		.ofType<GoToExpandAction>(ToolsActionsTypes.GO_TO_EXPAND)
		.map(({ payload }) => new SetClickOutside(!payload));

	/**
	 * @type Effect
	 * @name autoCloseMenu$
	 * @ofType SetAutoCloseMenu
	 * @action SetClickOutside
	 */
	@Effect()
	autoCloseMenu$: Observable<SetClickOutside> = this.actions$
		.ofType<SetAutoCloseMenu>(ToolsActionsTypes.SET_AUTOCLOSE_MENU)
		.map(({ payload }) => new SetClickOutside(payload));

	/**
	 * @type Effect
	 * @name unselectMenuItem$
	 * @ofType UnSelectMenuItemAction
	 * @action GoToExpandAction
	 */
	@Effect()
	unselectMenuItem$: Observable<GoToExpandAction> = this.actions$
		.ofType<UnSelectMenuItemAction>(MenuActionTypes.UNSELECT_MENU_ITEM)
		.map(() => new GoToExpandAction(false));

	/**
	 * @type Effect
	 * @name updateFiltersBadge$
	 * @ofType InitializeFiltersSuccessAction, UpdateFilterAction, ToggleOnlyFavoriteAction
	 * @dependencies filters
	 * @action SetBadgeAction
	 */
	@Effect()
	updateFiltersBadge$: Observable<any> = this.actions$
		.ofType(...facetChangesActionType)
		.withLatestFrom(this.store$.select(filtersStateSelector), (action, filtersState: IFiltersState) => filtersState)
		.map(({ filters, showOnlyFavorites }: IFiltersState) => {
			let badge = '0';

			if (showOnlyFavorites) {
				badge = '★';
			} else {
				const enumFilterValues = Array.from(filters.values())
					.filter(value => value instanceof EnumFilterMetadata) as EnumFilterMetadata[];

				badge = enumFilterValues.reduce((badgeNum: number, { enumsFields }) => {
					const someUnchecked = Array.from(enumsFields.values()).some(({ isChecked }) => !isChecked);
					return someUnchecked ? badgeNum + 1 : badgeNum;
				}, 0).toString();
			}

			return new SetBadgeAction({ key: 'Filters', badge });
		})
		.share();

	constructor(private actions$: Actions, private store$: Store<IAppState>) {
	}
}
