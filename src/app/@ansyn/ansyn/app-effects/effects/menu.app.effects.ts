import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { MenuActionTypes, SetClickOutside } from '@ansyn/menu';
import { UpdateMapSizeAction } from '@ansyn/map-facade';
import { RedrawTimelineAction } from '@ansyn/overlays';
import 'rxjs/add/operator/withLatestFrom';
import { IAppState } from '../app.effects.module';
import { Store } from '@ngrx/store';
import { selectSubMenu } from '@ansyn/menu-items';

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
			new RedrawTimelineAction()
		]);

	/**
	 * @type Effect
	 * @name autoCloseMenu$
	 * @ofType annotationFlag$
	 * @action SetClickOutside
	 */
	@Effect()
	autoCloseMenu$: Observable<SetClickOutside> = this.store$
		.select(selectSubMenu)
		.distinctUntilChanged()
		.map((subMenu) => new SetClickOutside(isNaN(subMenu)));

	constructor(protected actions$: Actions, protected store$: Store<IAppState>) {
	}
}
