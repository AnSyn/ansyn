import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { IAppState } from '../../app.effects.module';
import { Store } from '@ngrx/store';
import { ImageryCommunicatorService } from '@ansyn/imagery';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/fromPromise';
import { DisplayOverlaySuccessAction, OverlaysActionTypes } from '@ansyn/overlays/actions/overlays.actions';
import { MapFacadeService } from '@ansyn/map-facade/services/map-facade.service';
import { mapStateSelector } from '@ansyn/map-facade/reducers/map.reducer';
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
		.map(([{ payload }, mapsState]) => {
			const communicator = this.imageryCommunicatorService.provide(payload.mapId);

			this.pointNorth(payload.mapId).then(north => {
				communicator.setVirtualNorth(north);
				communicator.setRotation(north + payload.rotation);

				const mapState = MapFacadeService.mapById(mapsState.mapsList, payload.mapId);
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
