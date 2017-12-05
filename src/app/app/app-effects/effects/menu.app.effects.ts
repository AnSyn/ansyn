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
import { Store } from '@ngrx/store';

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

	constructor(protected actions$: Actions, protected store$: Store<IAppState>) {
	}
}
