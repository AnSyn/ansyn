import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable } from 'rxjs';
import { IAppState } from '../app.effects.module';
import { select, Store } from '@ngrx/store';
import { UpdateMapSizeAction } from '@ansyn/map-facade';
import { MenuActionTypes, SetAutoClose } from '@ansyn/menu';
import { selectSubMenu } from '../../modules/menu-items/tools/reducers/tools.reducer';
import { map, mergeMap } from 'rxjs/operators';
import { RedrawTimelineAction, SetTotalOverlaysAction } from '../../modules/overlays/actions/overlays.actions';
import { LoadDefaultCaseAction } from '../../modules/menu-items/cases/actions/cases.actions';
import { selectDropsWithoutSpecialObjects } from '../../modules/overlays/reducers/overlays.reducer';
import { IOverlayDrop } from '../../modules/overlays/models/overlay.model';

@Injectable()
export class MenuAppEffects {

	@Effect()
	onContainerChanged$: Observable<UpdateMapSizeAction> = this.actions$
		.pipe(
			ofType(MenuActionTypes.TRIGGER.CONTAINER_CHANGED),
			mergeMap(() => [
				new UpdateMapSizeAction(),
				new RedrawTimelineAction()
			])
		);

	@Effect()
	loadOverlays$: Observable<any> = this.store$
		.pipe(
			select(selectDropsWithoutSpecialObjects),
			map((overlays: IOverlayDrop[]) => new SetTotalOverlaysAction(overlays.length)));


	@Effect()
	autoCloseMenu$: Observable<SetAutoClose> = this.store$
		.pipe(
			select(selectSubMenu),
			map((subMenu) => new SetAutoClose(typeof subMenu !== 'number'))
		);

	@Effect()
	onResetApp$: Observable<LoadDefaultCaseAction> = this.actions$
		.pipe(
			ofType(MenuActionTypes.RESET_APP),
			map(() => new LoadDefaultCaseAction())
		);

	constructor(protected actions$: Actions, protected store$: Store<IAppState>) {
	}
}
