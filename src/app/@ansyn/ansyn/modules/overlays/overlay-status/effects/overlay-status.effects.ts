import { Injectable } from '@angular/core';
import {
	CommunicatorEntity,
	geojsonMultiPolygonToPolygons,
	geojsonPolygonToMultiPolygon,
	ImageryCommunicatorService,
	ImageryMapPosition,
	IMapSettings,
	unifyPolygons
} from '@ansyn/imagery';
import {
	MapFacadeService,
	mapStateSelector,
	selectMaps, selectMapsList,
	SetToastMessageAction,
	UpdateMapAction
} from '@ansyn/map-facade';
import { AnnotationMode, DisabledOpenLayersMapName, OpenlayersMapName } from '@ansyn/ol';
import { Actions, Effect, ofType, createEffect } from '@ngrx/effects';
import { Dictionary } from '@ngrx/entity';
import { Store } from '@ngrx/store';
import { EMPTY, Observable } from 'rxjs';
import { fromPromise } from 'rxjs/internal-compatibility';
import { catchError, filter, map, mergeMap, switchMap, withLatestFrom } from 'rxjs/operators';
import {
	BackToWorldFailed,
	BackToWorldSuccess,
	BackToWorldView,
	OverlayStatusActionsTypes,
	SetOverlayScannedAreaDataAction,
	ToggleDraggedModeAction,
	ActivateScannedAreaAction
} from '../actions/overlay-status.actions';
import { SetAnnotationMode } from '../../../menu-items/tools/actions/tools.actions';
import { DisplayOverlaySuccessAction, OverlaysActionTypes } from '../../actions/overlays.actions';
import { IOverlaysScannedAreaData, IOverlaysTranslationData } from '../../../menu-items/cases/models/case.model';
import { selectScannedAreaData, selectTranslationData } from '../reducers/overlay-status.reducer';
import { IOverlay } from '../../models/overlay.model';
import { feature } from '@turf/turf';


@Injectable()
export class OverlayStatusEffects {
	backToWorldView$ = createEffect(() => this.actions$
		.pipe(
			ofType(BackToWorldView),
			withLatestFrom(this.store$.select(selectMaps)),
			filter(([payload, entities]: [{ mapId: string }, Dictionary<IMapSettings>]) => Boolean(entities[payload.mapId])),
			map(([payload, entities]: [{ mapId: string }, Dictionary<IMapSettings>]) => {
				const mapId = payload.mapId;
				const selectedMap = entities[mapId];
				const communicator = this.communicatorsService.provide(mapId);
				const { position } = selectedMap.data;
				return [payload, selectedMap, communicator, position];
			}),
			filter(([payload, selectedMap, communicator, position]: [{ mapId: string }, IMapSettings, CommunicatorEntity, ImageryMapPosition]) => Boolean(communicator)),
			switchMap(([payload, selectedMap, communicator, position]: [{ mapId: string }, IMapSettings, CommunicatorEntity, ImageryMapPosition]) => {
				const disabledMap = communicator.activeMapName === DisabledOpenLayersMapName;
				this.store$.dispatch(UpdateMapAction({
					id: communicator.id,
					changes: { data: { ...selectedMap.data, overlay: null, isAutoImageProcessingActive: false } }
				}));

				return fromPromise(disabledMap ? communicator.setActiveMap(OpenlayersMapName, position) : communicator.loadInitialMapSource(position))
					.pipe(
						map(() => BackToWorldSuccess()),
						catchError((err) => {
							this.store$.dispatch(SetToastMessageAction({
								toastText: 'Failed to load map',
								showWarningIcon: true
							}));
							this.store$.dispatch(BackToWorldFailed({ mapId: payload.mapId, error: err }));
							return EMPTY;
						})
					);
			})
		)
	);

	@Effect()
	toggleTranslate$ = createEffect(() => this.actions$.pipe(
		ofType(ToggleDraggedModeAction),
		withLatestFrom(this.store$.select(selectMapsList)),
		mergeMap(([payload, maps]: [{ mapId: string, overlayId: string, dragged: boolean }, IMapSettings[]]) => {
			let annotationMode = null;

			const resultActions = [];
			if (payload.dragged) {
				annotationMode = AnnotationMode.Translate;
			}
			const filteredMaps = maps.filter((mapSettings) => mapSettings.id !== payload.mapId &&
				Boolean(mapSettings.data.overlay) && mapSettings.data.overlay.id === payload.overlayId);
			filteredMaps.forEach((mapSettings) => {
				resultActions.push(SetAnnotationMode({
					annotationMode: annotationMode,
					mapId: mapSettings.id
				}));
			});
			resultActions.push(SetAnnotationMode({ annotationMode: annotationMode, mapId: payload.mapId }));
			return resultActions;
		}))
	);

	onScannedAreaActivation$ = createEffect(() => this.actions$.pipe(
		ofType(ActivateScannedAreaAction),
		withLatestFrom(this.store$.select(mapStateSelector), this.store$.select(selectScannedAreaData)),
		map(([action, mapState, overlaysScannedAreaData]) => {
			const mapSettings: IMapSettings = MapFacadeService.activeMap(mapState);
			return [mapSettings.data.position, mapSettings.data.overlay, overlaysScannedAreaData];
		}),
		filter(([position, overlay, overlaysScannedAreaData]: [ImageryMapPosition, IOverlay, IOverlaysScannedAreaData]) => Boolean(position) && Boolean(overlay)),
		map(([position, overlay, overlaysScannedAreaData]: [ImageryMapPosition, IOverlay, IOverlaysScannedAreaData]) => {
			let scannedArea = overlaysScannedAreaData && overlaysScannedAreaData[overlay.id];
			if (!scannedArea) {
				scannedArea = geojsonPolygonToMultiPolygon(position.extentPolygon);
			} else {
				try {
					const polygons = geojsonMultiPolygonToPolygons(scannedArea);
					polygons.push(position.extentPolygon);
					const featurePolygons = polygons.map((polygon) => {
						return feature(polygon);
					});
					const combinedResult = unifyPolygons(featurePolygons);
					if (combinedResult.geometry.type === 'MultiPolygon') {
						scannedArea = combinedResult.geometry;
					} else {	// polygon
						scannedArea = geojsonPolygonToMultiPolygon(combinedResult.geometry);
					}
				} catch (e) {
					console.error('failed to save scanned area', e);
					return EMPTY;
				}
			}
			return new SetOverlayScannedAreaDataAction({ id: overlay.id, area: scannedArea });
		}))
	);

	constructor(protected actions$: Actions,
				protected communicatorsService: ImageryCommunicatorService,
				protected store$: Store<any>) {
	}
}
