import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { MenuActionTypes } from '@ansyn/menu';
import { UpdateMapSizeAction } from '@ansyn/map-facade';
import { RedrawTimelineAction } from '@ansyn/overlays';
import 'rxjs/add/operator/withLatestFrom';
import { GoToExpandAction, ToolsActionsTypes } from '@ansyn/menu-items/tools/actions/tools.actions';
import { SetClickOutside } from '@ansyn/menu/actions/menu.actions';
import { IAppState } from '../app.effects.module';
import { Store } from '@ngrx/store';
import { IToolsState, toolsFlags, toolsStateSelector } from '@ansyn/menu-items';

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
	 * @ofType annotationFlag$
	 * @action SetClickOutside
	 */
	@Effect()
	autoCloseMenu$: Observable<SetClickOutside> = this.store$
		.select(toolsStateSelector)
		.pluck<IToolsState, Map<toolsFlags, boolean>>('flags')
		.map((flags) => flags.get(toolsFlags.annotations))
		.distinctUntilChanged()
		.map((annotationsFlag: boolean) => new SetClickOutside(!annotationsFlag));

	constructor(protected actions$: Actions, protected store$: Store<IAppState>) {
	}
}
