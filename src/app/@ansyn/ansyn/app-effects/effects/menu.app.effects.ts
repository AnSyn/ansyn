import { Inject, Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { EMPTY, Observable } from 'rxjs';
import { IAppState } from '../app.effects.module';
import { select, Store } from '@ngrx/store';
import { UpdateMapSizeAction, ToggleFooter, selectMapsList, SetOverlaysFootprintActive } from '@ansyn/map-facade';
import { IMenuConfig, MenuActionTypes, MenuConfig, SetAutoClose, ToggleIsPinnedAction, UnSelectMenuItemAction } from '@ansyn/menu';
import { selectSubMenu } from '../../modules/menu-items/tools/reducers/tools.reducer';
import { map, mergeMap, withLatestFrom, filter } from 'rxjs/operators';
import { RedrawTimelineAction, SetTotalOverlaysAction } from '../../modules/overlays/actions/overlays.actions';
import { LoadDefaultCaseAction } from '../../modules/menu-items/cases/actions/cases.actions';
import { selectDropsWithoutSpecialObjects } from '../../modules/overlays/reducers/overlays.reducer';
import { IOverlayDrop } from '../../modules/overlays/models/overlay.model';
import { COMPONENT_MODE } from '../../app-providers/component-mode';
import { StartMouseShadow, AnnotationSetProperties } from '../../modules/menu-items/tools/actions/tools.actions';
import { getInitialAnnotationsFeatureStyle, IMapSettings } from '@ansyn/imagery';
import { ResetAppActionSuccess } from '@ansyn/menu';

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
	onResetAppSuccess$ = this.actions$
		.pipe(
			ofType(MenuActionTypes.RESET_APP_SUCCESS),
			mergeMap(() => {
				if (this.componentMode) {
					window.open(this.menuConfig.baseUrl, '_blank');
					return EMPTY;
			}

				return [
					new LoadDefaultCaseAction(),
					new StartMouseShadow({fromUser: true}),
					new AnnotationSetProperties(getInitialAnnotationsFeatureStyle()),
					new ToggleIsPinnedAction(false),
					new UnSelectMenuItemAction(),
					new ToggleFooter(false)
				];
			})
		);

		@Effect()
		onResetAppSuccessDisableFootprint$ = this.actions$
			.pipe(
				ofType(MenuActionTypes.RESET_APP_SUCCESS),
				withLatestFrom(this.store$.select(selectMapsList)),
				filter(([action, mapsList]: [ResetAppActionSuccess, IMapSettings[]]) => Boolean(mapsList.length)),
				// mapsList[0].id gives the id of the map after the reset is done.
				map(([action, mapsList]: [ResetAppActionSuccess, IMapSettings[]]) => new SetOverlaysFootprintActive({mapId: mapsList[0].id, show: false}))
			);

	constructor(protected actions$: Actions, protected store$: Store<IAppState>,
		@Inject(COMPONENT_MODE) public componentMode: boolean,
		@Inject(MenuConfig) public menuConfig: IMenuConfig) {
	}

	resetApp() {
		if (!this.componentMode) {
			window.open(this.menuConfig.baseUrl, '_blank');
			return new LoadDefaultCaseAction();
		}

		return EMPTY;
	}

}
