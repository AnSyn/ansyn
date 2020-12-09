import { Inject, Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable } from 'rxjs';
import { IAppState } from '../app.effects.module';
import { select, Store } from '@ngrx/store';
import { ToggleFooter, UpdateMapSizeAction } from '@ansyn/map-facade';
import {
	IMenuConfig,
	MenuActionTypes,
	MenuConfig,
	ResetAppAction,
	SetAutoClose,
	UnSelectMenuItemAction
} from '@ansyn/menu';
import { selectSubMenu } from '../../modules/menu-items/tools/reducers/tools.reducer';
import { concatMap, map, mergeMap } from 'rxjs/operators';
import {
	LoadOverlaysSuccessAction,
	RedrawTimelineAction,
	SetTotalOverlaysAction
} from '../../modules/overlays/actions/overlays.actions';
import { CloseModalAction, LoadDefaultCaseAction } from '../../modules/menu-items/cases/actions/cases.actions';
import { selectDropsWithoutSpecialObjects } from '../../modules/overlays/reducers/overlays.reducer';
import { IOverlayDrop } from '../../modules/overlays/models/overlay.model';
import { COMPONENT_MODE } from '../../app-providers/component-mode';
import { InitializeFiltersAction } from '../../modules/filters/actions/filters.actions';
import { SetLayersModal } from '../../modules/menu-items/layers-manager/actions/layers.actions';
import { SelectedModalEnum } from '../../modules/menu-items/layers-manager/reducers/layers-modal';

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
			map((overlays: IOverlayDrop[]) => new SetTotalOverlaysAction({ number: overlays.length, showLog: true })));

	@Effect()
	autoCloseMenu$: Observable<SetAutoClose> = this.store$
		.pipe(
			select(selectSubMenu),
			map((subMenu) => new SetAutoClose(typeof subMenu !== 'number'))
		);

	@Effect()
	onResetApp$ = this.actions$.pipe(
		ofType<ResetAppAction>(MenuActionTypes.RESET_APP),
		concatMap(() => [
			new CloseModalAction(),
			new SetLayersModal({ type: SelectedModalEnum.none, layer: null }),
			new UnSelectMenuItemAction(),
			new ToggleFooter(false),
			new LoadOverlaysSuccessAction([], true),
			new InitializeFiltersAction(),
			new LoadDefaultCaseAction()
		])
	);

	constructor(
		protected actions$: Actions,
		protected store$: Store<IAppState>,
		@Inject(COMPONENT_MODE) public componentMode: boolean,
		@Inject(MenuConfig) public menuConfig: IMenuConfig
	) {
	}

}
