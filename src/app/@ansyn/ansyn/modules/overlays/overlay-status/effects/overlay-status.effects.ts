import { Inject, Injectable } from '@angular/core';
import {
	geojsonMultiPolygonToPolygons,
	geojsonPolygonToMultiPolygon,
	ImageryCommunicatorService,
	IImageryMapPosition,
	IMapSettings,
	unifyPolygons,
	getPolygonIntersectionRatioWithMultiPolygon
} from '@ansyn/imagery';
import {
	MapActionTypes,
	MapFacadeService,
	mapStateSelector,
	selectMapsList,
	SetToastMessageAction,
	UpdateMapAction,
	SetLayoutSuccessAction, selectActiveMapId
} from '@ansyn/map-facade';
import { AnnotationMode, DisabledOpenLayersMapName, OpenlayersMapName } from '@ansyn/ol';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { EMPTY, Observable, from } from 'rxjs';
import { catchError, filter, map, mergeMap, switchMap, withLatestFrom, pluck, tap } from 'rxjs/operators';
import {
	BackToWorldFailed,
	BackToWorldSuccess,
	BackToWorldView,
	OverlayStatusActionsTypes,
	SetOverlayScannedAreaDataAction,
	ToggleDraggedModeAction,
} from '../actions/overlay-status.actions';
import { SetAnnotationMode } from '../../../status-bar/components/tools/actions/tools.actions';
import { IOverlaysScannedAreaData } from '../../../menu-items/cases/models/case.model';
import {
	ITranslationsData,
	selectScannedAreaData,
	selectTranslationData
} from '../reducers/overlay-status.reducer';
import { IOverlay } from '../../models/overlay.model';
import { feature, difference } from '@turf/turf';
import { ImageryVideoMapType } from '@ansyn/imagery-video';
import { OverlayOutOfBoundsService } from '../../../../services/overlay-out-of-bounds/overlay-out-of-bounds.service';
import { IOverlayStatusConfig, overlayStatusConfig } from '../config/overlay-status-config';

@Injectable()
export class OverlayStatusEffects {
	@Effect()
	backToWorldView$: Observable<any> = this.actions$
		.pipe(
			ofType(OverlayStatusActionsTypes.BACK_TO_WORLD_VIEW),
			filter( (action: BackToWorldView) => this.communicatorsService.has(action.payload.mapId)),
			switchMap(({payload}: BackToWorldView) => {
				const communicator = this.communicatorsService.provide(payload.mapId);
				const mapData = {...communicator.mapSettings.data};
				const position = mapData.position;
				const disabledMap = communicator.activeMapName === DisabledOpenLayersMapName || communicator.activeMapName === ImageryVideoMapType;

				return from<any>(disabledMap ? communicator.setActiveMap(OpenlayersMapName, position) : communicator.loadInitialMapSource(position))
					.pipe(
						map(() => new BackToWorldSuccess(payload)),
						catchError((err) => {
							this.store$.dispatch(new SetToastMessageAction({
								toastText: 'Failed to load map',
								showWarningIcon: true
							}));
							this.store$.dispatch(new BackToWorldFailed({ mapId: payload.mapId, error: err }));
							return EMPTY;
						})
					);
			})
		);

	@Effect()
	backToWorldSuccessRemoveOverlay$: Observable<UpdateMapAction> = this.actions$.pipe(
		ofType(OverlayStatusActionsTypes.BACK_TO_WORLD_SUCCESS),
		map( (action: BackToWorldSuccess) => {
			const communicator = this.communicatorsService.provide(action.payload.mapId);
			const mapData = {...communicator.mapSettings.data};
			return new UpdateMapAction({
				id: action.payload.mapId,
				changes: { data: { ...mapData, overlay: null } }
			})
		})
	);

	@Effect({ dispatch: false })
	onOverlayOutOfBounds: Observable<any> = this.actions$.pipe(
		ofType(OverlayStatusActionsTypes.BACK_TO_EXTENT),
		tap(() => this.outOfBoundsService.backToExtent()));

	@Effect()
	toggleTranslate$: Observable<any> = this.actions$.pipe(
		ofType(OverlayStatusActionsTypes.TOGGLE_DRAGGED_MODE),
		withLatestFrom(this.store$.select(selectMapsList)),
		mergeMap(([action, maps]: [ToggleDraggedModeAction, IMapSettings[]]) => {
			let annotationMode = null;

			const resultActions = [];
			if (action.payload.dragged) {
				annotationMode = AnnotationMode.Translate;
			}
			const filteredMaps = maps.filter((mapSettings) => mapSettings.id !== action.payload.mapId &&
				Boolean(mapSettings.data.overlay) && mapSettings.data.overlay.id === action.payload.overlayId);
			filteredMaps.forEach((mapSettings) => {
				resultActions.push(new SetAnnotationMode({
					annotationMode: annotationMode,
					mapId: mapSettings.id
				}));
			});
			resultActions.push(new SetAnnotationMode({ annotationMode: annotationMode, mapId: action.payload.mapId }));
			return resultActions;
		})
	);

	@Effect()
	onScannedAreaActivation$: Observable<any> = this.actions$.pipe(
		ofType(OverlayStatusActionsTypes.ACTIVATE_SCANNED_AREA),
		withLatestFrom(this.store$.select(mapStateSelector), this.store$.select(selectScannedAreaData)),
		map(([action, mapState, overlaysScannedAreaData]) => {
			const mapSettings: IMapSettings = MapFacadeService.activeMap(mapState);
			return [mapSettings.data.position, mapSettings.data.overlay, overlaysScannedAreaData];
		}),
		filter(([position, overlay, overlaysScannedAreaData]: [IImageryMapPosition, IOverlay, IOverlaysScannedAreaData]) => Boolean(position) && Boolean(overlay)),
		map(([position, overlay, overlaysScannedAreaData]: [IImageryMapPosition, IOverlay, IOverlaysScannedAreaData]) => {
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
					let combinedResult = unifyPolygons(featurePolygons);
					let scannedAreaContainsExtentPolygon = false;

					scannedArea.coordinates.forEach(coordinates => {
						let multiPolygon = JSON.parse(JSON.stringify(scannedArea));
						multiPolygon.coordinates = [coordinates];

						if (getPolygonIntersectionRatioWithMultiPolygon(position.extentPolygon, multiPolygon)) {
							scannedAreaContainsExtentPolygon = true;
						}
					});

					if (scannedAreaContainsExtentPolygon) {
						combinedResult = difference(combinedResult, position.extentPolygon);
					}

					if (combinedResult === null) {
						scannedArea = null;
					} else if (combinedResult.geometry.type === 'MultiPolygon') {
						scannedArea = combinedResult.geometry;
					} else {
						scannedArea = geojsonPolygonToMultiPolygon(combinedResult.geometry);
					}
				} catch (e) {
					console.error('failed to save scanned area', e);
					return EMPTY;
				}
			}
			return new SetOverlayScannedAreaDataAction({ id: overlay.id, area: scannedArea });
		}));

	@Effect()
	onSetLayoutDisableTranslateMode$ = this.actions$.pipe(
		ofType<SetLayoutSuccessAction>(MapActionTypes.SET_LAYOUT_SUCCESS),
		withLatestFrom(this.store$.select(selectTranslationData), this.store$.select(selectActiveMapId)),
		filter(([action, translateData, activeMap]: [SetLayoutSuccessAction, ITranslationsData, string]) => Boolean(translateData && Object.keys(translateData).length)),
		mergeMap(([action, translateData, activeMap]: [SetLayoutSuccessAction, ITranslationsData, string]) => {
			const actions = Object.keys(translateData)
				.filter(id => Boolean(translateData[id].dragged))
				.map(id => new ToggleDraggedModeAction({ mapId: activeMap, overlayId: id, dragged: false }));
			return actions
		})
	);

	constructor(protected actions$: Actions,
				protected communicatorsService: ImageryCommunicatorService,
				protected store$: Store<any>,
				protected outOfBoundsService: OverlayOutOfBoundsService,
				@Inject(overlayStatusConfig) protected config: IOverlayStatusConfig) {
	}
}
