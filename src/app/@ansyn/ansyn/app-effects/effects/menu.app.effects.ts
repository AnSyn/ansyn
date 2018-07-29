import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable } from 'rxjs';
import { IAppState } from '../app.effects.module';
import { select, Store } from '@ngrx/store';
import { UpdateMapSizeAction } from '@ansyn/map-facade/actions/map.actions';
import { MenuActionTypes, SetAutoClose } from '@ansyn/menu/actions/menu.actions';
import { RedrawTimelineAction } from '@ansyn/overlays/actions/overlays.actions';
import { selectSubMenu } from '@ansyn/menu-items/tools/reducers/tools.reducer';
import { mergeMap } from 'rxjs/operators';
import { distinctUntilChanged, map } from 'rxjs/internal/operators';

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
		.pipe(
			ofType(MenuActionTypes.TRIGGER.CONTAINER_CHANGED),
			mergeMap(() => [
				new UpdateMapSizeAction(),
				new RedrawTimelineAction()
			])
		)


	/**
	 * @type Effect
	 * @name autoCloseMenu$
	 * @ofType annotationFlag$
	 * @action SetAutoClose
	 */
	@Effect()
	autoCloseMenu$: Observable<SetAutoClose> = this.store$
		.pipe(
			select(selectSubMenu),
			distinctUntilChanged(),
			map((subMenu) => new SetAutoClose(typeof subMenu !== 'number'))
		);

	constructor(protected actions$: Actions, protected store$: Store<IAppState>) {
	}
}
