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
import { MapFacadeService } from '@ansyn/map-facade/services/map-facade.service';
import { mapStateSelector, IMapState } from '@ansyn/map-facade/reducers/map.reducer';
import {
	NorthCalculationsPlugin,
	openLayersNorthCalculations
} from '@ansyn/open-layers-north-calculations/plugin/north-calculations-plugin';
import { LoggerService } from '@ansyn/core';

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
		.withLatestFrom(this.store$.select(mapStateSelector))
		.map(([action, mapsState]) => {
			const communicator = this.imageryCommunicatorService.provide(action.payload.mapId);
			return [action, mapsState, communicator];
		})
		.filter(([action, mapsState, communicator]: [DisplayOverlaySuccessAction, IMapState, CommunicatorEntity]) => Boolean(communicator) && communicator.activeMapName !== 'disabledOpenLayersMap')
		.map(([action, mapsState, communicator]: [DisplayOverlaySuccessAction, IMapState, CommunicatorEntity]) => {
			this.pointNorth(action.payload.mapId).then(north => {
				communicator.setVirtualNorth(north);
				let rotation = 0;
				switch (action.payload.rotationData.rotationType) {
					case 'Align North':
						rotation = 0;
						break;
					case 'Imagery Perspective':
						// back to imagery direction instead of imagery north direction
						// overlay.azimuth - virtualNorth
						rotation = action.payload.rotationData.rotationAngle - north;
						break;
					case 'User Perspective':
						rotation = action.payload.rotationData.rotationAngle;
						break;
				}
				communicator.setRotation(north + rotation);

				const mapState = MapFacadeService.mapById(mapsState.mapsList, action.payload.mapId);
				mapState.data.overlay.northAngle = north;
			});
		});

	constructor(protected actions$: Actions,
				protected store$: Store<IAppState>,
				protected imageryCommunicatorService: ImageryCommunicatorService,
				protected loggerService: LoggerService) {
	}

	pointNorth(mapId: string): Promise<number> {
		// return new Promise(resolve => setTimeout(() => resolve(Math.PI / 2), 500));
		return new Promise(resolve => {
			const comEntity = this.imageryCommunicatorService.provide(mapId);
			const northPlugin = <NorthCalculationsPlugin>comEntity.getPlugin(openLayersNorthCalculations);

			if (!northPlugin) {
				comEntity.setRotation(0);
				resolve(0);
			} else {
				northPlugin.setCorrectedNorth(comEntity.ActiveMap.mapObject)
					.then(north => resolve(north), (reason) => {
						this.loggerService.warn(`setCorrectedNorth failed: ${reason}`);
					});
			}
		});
	}
}
