import { Inject, Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { EMPTY, Observable } from 'rxjs';
import { IAppState } from '../app.effects.module';
import { select, Store } from '@ngrx/store';
import { UpdateMapSizeAction, ToggleFooter } from '@ansyn/map-facade';
import { IMenuConfig, MenuActionTypes, MenuConfig, SetAutoClose } from '@ansyn/menu';
import { selectSubMenu, initialAnnotationProperties } from '../../modules/menu-items/tools/reducers/tools.reducer';
import { map, mergeMap } from 'rxjs/operators';
import { RedrawTimelineAction, SetTotalOverlaysAction } from '../../modules/overlays/actions/overlays.actions';
import { LoadDefaultCaseAction } from '../../modules/menu-items/cases/actions/cases.actions';
import { selectDropsWithoutSpecialObjects } from '../../modules/overlays/reducers/overlays.reducer';
import { IOverlayDrop } from '../../modules/overlays/models/overlay.model';
import { COMPONENT_MODE } from '../../app-providers/component-mode';
import { ShowOverlaysFootprintAction, StartMouseShadow, AnnotationSetProperties } from '../../modules/menu-items/tools/actions/tools.actions';
import { ToggleIsPinnedAction, UnSelectMenuItemAction } from '../../../menu/actions/menu.actions';

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
	onResetApp$ = this.actions$
		.pipe(
			ofType(MenuActionTypes.RESET_APP),
			mergeMap(() => {
				if (this.componentMode) {
					window.open(this.menuConfig.baseUrl, '_blank');
					return EMPTY;
				}

				return [
					new LoadDefaultCaseAction(),
					new ShowOverlaysFootprintAction('None'),
					new StartMouseShadow({fromUser: true}),
					new AnnotationSetProperties(initialAnnotationProperties),
					new ToggleIsPinnedAction(false),
					new UnSelectMenuItemAction(),
					new ToggleFooter(false)
				];
			})
		);

	resetApp() {
		if (!this.componentMode) {
			window.open(this.menuConfig.baseUrl, '_blank');
			return new LoadDefaultCaseAction();
		}

		return EMPTY;
	}

	constructor(protected actions$: Actions, protected store$: Store<IAppState>,
				@Inject(COMPONENT_MODE) public componentMode: boolean,
				@Inject(MenuConfig) public menuConfig: IMenuConfig) {
	}
}
