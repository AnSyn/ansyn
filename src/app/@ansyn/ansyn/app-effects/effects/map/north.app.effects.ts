import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { IAppState } from '../../app.effects.module';
import { Store } from '@ngrx/store';
import { CommunicatorEntity, ImageryCommunicatorService } from '@ansyn/imagery';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/fromPromise';
import { DisplayOverlaySuccessAction, OverlaysActionTypes } from '@ansyn/overlays/actions/overlays.actions';
import {
	NorthCalculationsPlugin,
	openLayersNorthCalculations
} from '@ansyn/plugins/openlayers/open-layers-north-calculations/plugin/north-calculations-plugin';
import {
	BackToWorldSuccess, BackToWorldView, CaseOrientation, CoreActionTypes, LoggerService,
	Overlay
} from '@ansyn/core';
import { MapActionTypes } from '@ansyn/map-facade/actions/map.actions';
import { IStatusBarState, statusBarStateSelector } from '@ansyn/status-bar';

@Injectable()
export class NorthAppEffects {

	/**
	 * @type Effect
	 * @name pointNorth$
	 * @ofType DisplayOverlaySuccessAction
	 * @description When an overlay is displayed, we calculate the overlay's real north, and update it.
	 * Then rotate the overlay to the desired display position
	 */
	@Effect({ dispatch: false })
	pointNorth$: Observable<any> = this.actions$
		.ofType<DisplayOverlaySuccessAction>(OverlaysActionTypes.DISPLAY_OVERLAY_SUCCESS)
		.withLatestFrom(this.store$.select(statusBarStateSelector), ({ payload }: DisplayOverlaySuccessAction, { comboBoxesProperties }: IStatusBarState) => {
			const communicator = this.imageryCommunicatorService.provide(payload.mapId);
			return [payload.ignoreRotation, communicator, comboBoxesProperties.orientation, payload.overlay];
		})
		.filter(([ignoreRotation, communicator]: [boolean, CommunicatorEntity, CaseOrientation, Overlay]) => Boolean(communicator) && communicator.activeMapName !== 'disabledOpenLayersMap')
		.switchMap(([ignoreRotation, communicator, orientation, overlay]: [boolean, CommunicatorEntity, CaseOrientation, Overlay]) => {
			return Observable.fromPromise(this.pointNorth(communicator))
				.do(virtualNorth => {
					communicator.setVirtualNorth(virtualNorth);
					if (!ignoreRotation) {
						switch (orientation) {
							case 'Align North':
								communicator.setRotation(virtualNorth);
								break;
							case 'Imagery Perspective':
								communicator.setRotation(overlay.azimuth);
								break;
						}
					}
				});
		});

	/**
	 * @type Effect
	 * @name backToWorldSuccessSetNorth$
	 * @ofType BackToWorldSuccessAction
	 * @description When map back to base layer, we rotate the map via orientation
	 */
	@Effect({ dispatch: false })
	backToWorldSuccessSetNorth$ = this.actions$
		.ofType<BackToWorldSuccess>(CoreActionTypes.BACK_TO_WORLD_SUCCESS)
		.withLatestFrom(this.store$.select(statusBarStateSelector))
		.do(([{ payload }, { comboBoxesProperties }]: [BackToWorldView, IStatusBarState]) => {
			const communicator = this.imageryCommunicatorService.provide(payload.mapId);
			communicator.setVirtualNorth(0);
			switch (comboBoxesProperties.orientation) {
				case 'Align North':
				case 'Imagery Perspective':
					communicator.setRotation(0);
			}
		});

	constructor(protected actions$: Actions,
				protected store$: Store<IAppState>,
				protected imageryCommunicatorService: ImageryCommunicatorService,
				protected loggerService: LoggerService) {
	}

	pointNorth(comEntity: CommunicatorEntity): Promise<number> {
		comEntity.updateSize();
		return new Promise(resolve => {
			const northPlugin = <NorthCalculationsPlugin>comEntity.getPlugin(openLayersNorthCalculations);
			if (!northPlugin) {
				resolve(0);
			} else {
				const currentRotation = comEntity.ActiveMap.mapObject.getView().getRotation();
				northPlugin.setCorrectedNorth(comEntity.ActiveMap)
					.then(north => {
						comEntity.ActiveMap.mapObject.getView().setRotation(currentRotation);
						resolve(north);
					}, reason => {
						this.loggerService.warn(`setCorrectedNorth failed: ${reason}`);
					});
			}
		});
	}
}
