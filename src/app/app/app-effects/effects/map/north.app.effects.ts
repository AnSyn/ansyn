import { Actions, Effect } from '@ngrx/effects';
import {
	CalcNorthDirectionAction,
	PointNorthAction,
	UpdateNorthAngleAction,
	MapActionTypes
} from '@ansyn/map-facade';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { IAppState } from '../../app.effects.module';
import { Store } from '@ngrx/store';
import { ImageryCommunicatorService } from '@ansyn/imagery';
import { openLayersNorthCalculations, NorthCalculationsPlugin } from '@ansyn/open-layers-north-calculations';
import { Overlay } from '@ansyn/core';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/fromPromise';
import { CaseMapState } from '@ansyn/core/models/case.model';

@Injectable()
export class NorthAppEffects {

	/**
	 * @type Effect
	 * @name pointNorth$
	 * @ofType ContextMenuShowAction
	 * @dependencies overlays
	 * @action ContextMenuGetFilteredOverlaysAction
	 */
	@Effect({ dispatch: false })
	pointNorth$: Observable<any> = this.actions$
		.ofType(MapActionTypes.NORTH.ROTATE_NORTH)
		.map((action: PointNorthAction) => {
			switch (action.payload.rotationType) {
				case 'ImageAngle': {
					this.pointPhotoAngle(action.payload.mapId, action.payload.overlay);
					break;
				}
				case 'North': {
					this.pointNorth(action.payload.mapId, action.payload.overlay);
					break;
				}
				default: {
					console.warn(`'${action.payload.rotationType}' is not a supported rotationType`);
				}
			}
		});

	/**
	 * @type Effect
	 * @name calcNorthAngle$
	 * @ofType CalcNorthDirectionAction
	 * @dependencies map
	 * @action UpdateNorthAngleAction
	 */
	@Effect()
	calcNorthAngleForOverlay$: Observable<any> = this.actions$
		.ofType<CalcNorthDirectionAction>(MapActionTypes.NORTH.CALC_NORTH_ANGLE)
		.filter((action: CalcNorthDirectionAction) => Boolean(action.payload.mapState.data.overlay))
		.map((action: CalcNorthDirectionAction) => {
			const mapState: CaseMapState = action.payload.mapState;
			const comEntity = this.imageryCommunicatorService.provide(mapState.id);
			const northPlugin = <NorthCalculationsPlugin>comEntity.getPlugin(openLayersNorthCalculations);
			return {mapState, comEntity, northPlugin };
		})
		.filter(({mapState, comEntity, northPlugin}) => Boolean(northPlugin))
		.mergeMap(({mapState, comEntity, northPlugin}) => {
			return Observable.fromPromise(northPlugin.getCorrectedNorthOnce(comEntity.ActiveMap.mapObject))
				.map((data: any) => {
					const northDirection = -data.northOffsetRad;
					return new UpdateNorthAngleAction({ mapId: mapState.id, angleRad: northDirection });
				});
		});
	// @Effect()
	// calcNorthAngle$: Observable<any> = this.actions$
	// 	.ofType<CalcNorthDirectionAction>(MapActionTypes.NORTH.CALC_NORTH_ANGLE)
	// 	.mergeMap((action: CalcNorthDirectionAction) => {
	// 		const mapState: CaseMapState = action.payload.mapState;
	// 		let northDirection;
	// 		if (!mapState.data.overlay) {
	// 			northDirection = mapState.data.position.projectedState.rotation;
	// 			return Observable.of(new UpdateNorthAngleAction({mapId: mapState.id, angleRad: northDirection}));
	// 		} else {
	// 			const comEntity = this.imageryCommunicatorService.provide(mapState.id);
	// 			const northPlugin = <NorthCalculationsPlugin>comEntity.getPlugin(openLayersNorthCalculations);
	// 			if (northPlugin) {
	// 				return Observable.fromPromise(northPlugin.getCorrectedNorthOnce(comEntity.ActiveMap.mapObject))
	// 					.map((data: any) => {
	// 						northDirection = -data.northOffsetRad;
	// 						return new UpdateNorthAngleAction({ mapId: mapState.id, angleRad: northDirection });
	// 					});
	// 			}
	// 		}
	// 	});

	/**
	 * @type Effect
	 * @name calcNorthAngle$
	 * @ofType CalcNorthDirectionAction
	 * @dependencies map
	 * @action UpdateNorthAngleAction
	 */
	@Effect()
	calcNorthAngleForWorldView$: Observable<any> = this.actions$
		.ofType<CalcNorthDirectionAction>(MapActionTypes.NORTH.CALC_NORTH_ANGLE)
		.filter((action: CalcNorthDirectionAction) => !action.payload.mapState.data.overlay)
		.mergeMap((action: CalcNorthDirectionAction) => {
			const mapState: CaseMapState = action.payload.mapState;
			let northDirection = mapState.data.position.projectedState.rotation;
			return Observable.of(new UpdateNorthAngleAction({mapId: mapState.id, angleRad: northDirection}));
		});

	constructor(protected actions$: Actions,
				protected store$: Store<IAppState>,
				protected imageryCommunicatorService: ImageryCommunicatorService) {
	}

	pointNorth(mapId: string, overlay?: Overlay) {
		const comEntity = this.imageryCommunicatorService.provide(mapId);
		if (!overlay) {
			comEntity.setRotation(0);
			return;
		}

		const northPlugin = <NorthCalculationsPlugin>comEntity.getPlugin(openLayersNorthCalculations);
		if (northPlugin) {
			northPlugin.setCorrectedNorth(comEntity.ActiveMap.mapObject);
		} else {
			comEntity.setRotation(0);
		}
	}

	pointPhotoAngle(mapId: string, overlay?: Overlay) {
		const comEntity = this.imageryCommunicatorService.provide(mapId);
		if (overlay) {
			comEntity.setRotation(overlay.azimuth);
		} else {
			comEntity.setRotation(0);
		}
	}
}
