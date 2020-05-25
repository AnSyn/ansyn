import { Inject, Injectable } from '@angular/core';
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
	MapActionTypes,
	MapFacadeService,
	mapStateSelector,
	selectMaps, selectMapsList,
	SetToastMessageAction,
	UpdateMapAction,
	SetLayoutSuccessAction, selectActiveMapId, IMapState
} from '@ansyn/map-facade';
import { AnnotationMode, DisabledOpenLayersMapName, OpenlayersMapName } from '@ansyn/ol';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Dictionary } from '@ngrx/entity';
import { Action, select, Store } from '@ngrx/store';
import { EMPTY, Observable } from 'rxjs';
import { fromPromise } from 'rxjs/internal-compatibility';
import { catchError, filter, map, mergeMap, switchMap, withLatestFrom, pluck } from 'rxjs/operators';
import {
	BackToWorldFailed,
	BackToWorldSuccess,
	BackToWorldView,
	OverlayStatusActionsTypes, SetAutoImageProcessing, SetAutoImageProcessingSuccess, SetManualImageProcessing,
	SetOverlayScannedAreaDataAction,
	ToggleDraggedModeAction,
	EnableImageProcessing,
	DisableImageProcessing
} from '../actions/overlay-status.actions';
import {
	SetActiveOverlaysFootprintModeAction,
	SetAnnotationMode,
} from '../../../menu-items/tools/actions/tools.actions';
import {
	ICaseMapState,
	ImageManualProcessArgs,
	IOverlaysScannedAreaData
} from '../../../menu-items/cases/models/case.model';
import {
	IOverlayStatusState,
	ITranslationsData, overlayStatusStateSelector,
	selectScannedAreaData,
	selectTranslationData
} from '../reducers/overlay-status.reducer';
import { IOverlay } from '../../models/overlay.model';
import { feature } from '@turf/turf';
import { ImageryVideoMapType } from '@ansyn/imagery-video';
import { IImageProcParam, IOverlayStatusConfig, overlayStatusConfig } from '../config/overlay-status-config';
import { isEqual } from "lodash";
import { CasesActionTypes } from '../../../menu-items/cases/actions/cases.actions';

@Injectable()
export class OverlayStatusEffects {
	@Effect()
	backToWorldView$: Observable<any> = this.actions$
		.pipe(
			ofType(OverlayStatusActionsTypes.BACK_TO_WORLD_VIEW),
			withLatestFrom(this.store$.select(selectMaps)),
			filter(([action, entities]: [BackToWorldView, Dictionary<IMapSettings>]) => Boolean(entities[action.payload.mapId])),
			map(([action, entities]: [BackToWorldView, Dictionary<IMapSettings>]) => {
				const mapId = action.payload.mapId;
				const selectedMap = entities[mapId];
				const communicator = this.communicatorsService.provide(mapId);
				const { position } = selectedMap.data;
				return [action.payload, selectedMap, communicator, position];
			}),
			filter(([payload, selectedMap, communicator, position]: [{ mapId: string }, IMapSettings, CommunicatorEntity, ImageryMapPosition]) => Boolean(communicator)),
			switchMap(([payload, selectedMap, communicator, position]: [{ mapId: string }, IMapSettings, CommunicatorEntity, ImageryMapPosition]) => {
				const disabledMap = communicator.activeMapName === DisabledOpenLayersMapName || communicator.activeMapName === ImageryVideoMapType;
				this.store$.dispatch(new UpdateMapAction({
					id: communicator.id,
					changes: { data: { ...selectedMap.data, overlay: null, isAutoImageProcessingActive: false, imageManualProcessArgs: this.defaultImageManualProcessArgs } }
				}));

				return fromPromise<any>(disabledMap ? communicator.setActiveMap(OpenlayersMapName, position) : communicator.loadInitialMapSource(position))
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
	onActiveMapChangesSetOverlaysFootprintMode$: Observable<any> = this.store$.select(selectActiveMapId).pipe(
		filter(Boolean),
		withLatestFrom(this.store$.select(mapStateSelector), (activeMapId, mapState: IMapState) => MapFacadeService.activeMap(mapState)),
		filter((activeMap: ICaseMapState) => Boolean(activeMap)),
		mergeMap<any, any>((activeMap: ICaseMapState) => {
			const actions: Action[] = [new SetActiveOverlaysFootprintModeAction(activeMap.data.overlayDisplayMode)];
			if (!Boolean(activeMap.data.overlay)) {
				actions.push(new DisableImageProcessing());
			}
			return actions;
		})
	);

	@Effect()
	onSelectCase$: Observable<DisableImageProcessing> = this.actions$.pipe(
		ofType(CasesActionTypes.SELECT_CASE),
		map(() => new DisableImageProcessing()));

	@Effect()
	toggleAutoImageProcessing$: Observable<any> = this.actions$.pipe(
		ofType(OverlayStatusActionsTypes.SET_AUTO_IMAGE_PROCESSING),
		withLatestFrom(this.store$.select(mapStateSelector)),
		mergeMap<any, any>(([action, mapsState]: [SetAutoImageProcessing, IMapState]) => {
			const activeMap: IMapSettings = MapFacadeService.activeMap(mapsState);
			const isAutoImageProcessingActive = !activeMap.data.isAutoImageProcessingActive;
			return [
				new UpdateMapAction({
					id: activeMap.id,
					changes: { data: { ...activeMap.data, isAutoImageProcessingActive } }
				}),
				new SetAutoImageProcessingSuccess(isAutoImageProcessingActive)
			];
		})
	);

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

	activeMap$ = this.store$.pipe(
		select(mapStateSelector),
		map((mapState) => MapFacadeService.activeMap(mapState)),
		filter(Boolean)
	);

	@Effect()
	updateImageProcessing$: Observable<any> = this.activeMap$.pipe(
		withLatestFrom(this.store$.select(overlayStatusStateSelector).pipe(pluck<IOverlayStatusState, ImageManualProcessArgs>('manualImageProcessingParams'))),
		mergeMap<any, any>(([map, manualImageProcessingParams]: [ICaseMapState, ImageManualProcessArgs]) => {
			const { overlay, isAutoImageProcessingActive, imageManualProcessArgs } = map.data;
			const actions = [new EnableImageProcessing(), new SetAutoImageProcessingSuccess(overlay ? isAutoImageProcessingActive : false)];
			if (!isEqual(imageManualProcessArgs, manualImageProcessingParams)) {
				actions.push(new SetManualImageProcessing(map.data && imageManualProcessArgs || this.defaultImageManualProcessArgs));
			}
			return actions;
		})
	);

	constructor(protected actions$: Actions,
				protected communicatorsService: ImageryCommunicatorService,
				protected store$: Store<any>,
				@Inject(overlayStatusConfig) protected config: IOverlayStatusConfig) {
	}

	get params(): Array<IImageProcParam> {
		return this.config.ImageProcParams;
	}

	get defaultImageManualProcessArgs(): ImageManualProcessArgs {
		return this.params.reduce<ImageManualProcessArgs>((initialObject: any, imageProcParam) => {
			return <any>{ ...initialObject, [imageProcParam.name]: imageProcParam.defaultValue };
		}, {});
	}
}
