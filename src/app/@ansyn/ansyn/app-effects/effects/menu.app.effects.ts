import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/withLatestFrom';
import { IAppState } from '../app.effects.module';
import { Store } from '@ngrx/store';
import { UpdateMapSizeAction } from '@ansyn/map-facade';
import { MenuActionTypes, SetAutoClose } from '@ansyn/menu';
import { RedrawTimelineAction } from '@ansyn/overlays';
import { selectSubMenu } from '@ansyn/menu-items';

@Injectable()
export class MenuAppEffects {

	@Effect()
	onContainerChanged$: Observable<UpdateMapSizeAction> = this.actions$
		.ofType(MenuActionTypes.TRIGGER.CONTAINER_CHANGED)
		.mergeMap(() => [
			new UpdateMapSizeAction(),
			new RedrawTimelineAction()
		]);

	@Effect()
	autoCloseMenu$: Observable<SetAutoClose> = this.store$
		.select(selectSubMenu)
		.distinctUntilChanged()
		.map((subMenu) => new SetAutoClose(typeof subMenu !== 'number'));

	constructor(protected actions$: Actions, protected store$: Store<IAppState>) {
	}
}
