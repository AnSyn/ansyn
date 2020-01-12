import { Injectable } from '@angular/core';
import { Actions, Effect, ofType, createEffect } from '@ngrx/effects';
import { Observable } from 'rxjs';
import { IAppState } from '../app.effects.module';
import { select, Store, createSelector } from '@ngrx/store';
import { UpdateMapSizeAction } from '@ansyn/map-facade';
import { MenuActionTypes, SetAutoClose } from '@ansyn/menu';
import { selectSubMenu } from '../../modules/menu-items/tools/reducers/tools.reducer';
import { map, mergeMap } from 'rxjs/operators';
import { RedrawTimelineAction } from '../../modules/overlays/actions/overlays.actions';
import { LoadDefaultCaseAction } from '../../modules/menu-items/cases/actions/cases.actions';

@Injectable()
export class MenuAppEffects {

	onContainerChanged$ = createEffect(() => this.actions$
		.pipe(
			ofType(MenuActionTypes.TRIGGER.CONTAINER_CHANGED),
			mergeMap(() => [
				UpdateMapSizeAction(),
				RedrawTimelineAction()
			]))
		);


	autoCloseMenu$ = createEffect(() => this.store$
		.pipe(
			select(selectSubMenu),
			map((subMenu) => SetAutoClose({payload: typeof subMenu !== 'number'}))
		));

	onResetApp$ = createEffect(() => this.actions$
		.pipe(
			ofType(MenuActionTypes.RESET_APP),
			map(() => LoadDefaultCaseAction())
		));

	constructor(protected actions$: Actions, protected store$: Store<IAppState>) {
	}
}
