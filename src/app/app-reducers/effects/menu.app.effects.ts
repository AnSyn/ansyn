import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { MenuActionTypes } from '@ansyn/menu';
import { UpdateMapSizeAction } from '@ansyn/map-facade';
import { RedrawTimelineAction } from '@ansyn/overlays';
import 'rxjs/add/operator/withLatestFrom';
import { GoToExpandAction, ToolsActionsTypes } from '@ansyn/menu-items/tools/actions/tools.actions';
import { SetClickOutside } from '@ansyn/menu/actions/menu.actions';

@Injectable()
export class MenuAppEffects {

	@Effect()
	onContainerChanged$: Observable<UpdateMapSizeAction> = this.actions$
		.ofType(MenuActionTypes.TRIGGER.CONTAINER_CHANGED)
		.mergeMap(() => [
			new UpdateMapSizeAction(),
			new RedrawTimelineAction(true)
		]);

	@Effect()
	onGoToExpand$: Observable<UpdateMapSizeAction> = this.actions$
		.ofType(ToolsActionsTypes.GO_TO_EXPAND)
		.map(({ payload }) => new SetClickOutside(!payload));

	@Effect()
	unselectMenuItem$: Observable<UpdateMapSizeAction> = this.actions$
		.ofType(MenuActionTypes.UNSELECT_MENU_ITEM)
		.map(() => new GoToExpandAction(false));

	constructor(private actions$: Actions) {
	}
}
