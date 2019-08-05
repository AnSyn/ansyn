import { Injectable } from '@angular/core';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { combineLatest, EMPTY, Observable } from 'rxjs';
import { Dictionary } from '@ngrx/entity/src/models';
import { filter, map, mergeMap, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { SetTasksPageToShow, TasksActionTypes } from '../../menu-items/algorithms/actions/tasks.actions';
import { PluginsActionTypes } from '../actions/plugins.actions';
import {
	IMapState,
	mapFacadeConfig,
	MapFacadeModule,
	MapFacadeService,
	mapStateSelector,
	SetToastMessageAction
} from '@ansyn/map-facade';
import { IAppState } from '../../../app-effects/app.effects.module';
import {
	CommunicatorEntity, geojsonMultiPolygonToPolygon,
	geojsonPolygonToMultiPolygon,
	ImageryCommunicatorService,
	ImageryMapPosition,
	IMapSettings
} from '@ansyn/imagery';
import { MultiPolygon, Point } from 'geojson';
import { SetActiveCenter } from '../../menu-items/tools/actions/tools.actions';
import { unifyPolygons } from '../../../../imagery/utils/geo';
import { selectScannedArea, selectSelectedCase } from '../../menu-items/cases/reducers/cases.reducer';
import { selectDropMarkup } from '../../overlays/reducers/overlays.reducer';
import { ICase, IOverlaysScannedArea } from '../../menu-items/cases/models/case.model';
import { IOverlay } from '../../overlays/models/overlay.model';
import { polygonToLine, multiPolygon, feature } from '@turf/turf';


@Injectable()
export class PluginsEffects {

	@Effect()
	setScannedAreaData$: Observable<any> = this.actions$.pipe(
		ofType(PluginsActionTypes.SET_SCANNED_AREA),
		withLatestFrom(this.store$.select(mapStateSelector), this.store$.select(selectSelectedCase)),
		map(([action, mapState, selectedCase]) => {
			const communicatorEntity = this.imageryCommunicatorService.provide(mapState.activeMapId)
			return [communicatorEntity, mapState, selectedCase];
		}),
		filter(communicator => Boolean(communicator)),
		switchMap(([communicator, mapState, selectedCase]: [CommunicatorEntity, IMapState, ICase]) => {
			const mapSettings: IMapSettings = MapFacadeService.activeMap(mapState);
			return communicator.getPosition().pipe(
				map((position: ImageryMapPosition) => [position, selectedCase, mapSettings.data.overlay]));
		}),
		filter(([position, selectedCase, overlay]: [ImageryMapPosition, ICase, IOverlay]) => Boolean(position) && Boolean(overlay)),
		tap(([position, selectedCase, overlay]: [ImageryMapPosition, ICase, IOverlay]) => {
			if (!selectedCase.state.overlaysScannedArea) {
				selectedCase.state.overlaysScannedArea = { [overlay.id]: multiPolygon(geojsonPolygonToMultiPolygon(position.extentPolygon).coordinates) };
			} else {
				try {
					const scannedAreaPolygon = geojsonMultiPolygonToPolygon(selectedCase.state.overlaysScannedArea[overlay.id].geometry);
					const combinedResult = unifyPolygons([feature(scannedAreaPolygon), feature(position.extentPolygon)]);
					if (combinedResult.geometry.type === 'MultiPolygon') {
						selectedCase.state.overlaysScannedArea[overlay.id] = <any>combinedResult;
					} else { // polygon
						selectedCase.state.overlaysScannedArea[overlay.id] = feature(geojsonPolygonToMultiPolygon(<any>combinedResult.geometry))
					}
				} catch (e) {
					console.error('failed to save scanned area', e);
				}
			}
		}),
		map(() => new SetToastMessageAction({
			toastText: `scanned Area saved`,
			showWarningIcon: false
		})));

	constructor(protected actions$: Actions,
				protected imageryCommunicatorService: ImageryCommunicatorService,
				public store$: Store<IAppState>) {
	}

}

