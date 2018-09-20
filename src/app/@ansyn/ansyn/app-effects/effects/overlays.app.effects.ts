import { Actions, Effect, ofType } from '@ngrx/effects';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
	DisplayMultipleOverlaysFromStoreAction,
	DisplayOverlayAction,
	DisplayOverlayFromStoreAction,
	DisplayOverlaySuccessAction,
	ExtendMap,
	IMarkUpData,
	IOverlaysState,
	MarkUpClass,
	overlayOverviewComponentConstants,
	OverlaysActionTypes,
	OverlaysService,
	overlaysStateSelector,
	selectdisplayOverlayHistory,
	selectDropMarkup,
	selectOverlaysMap,
	SetFilteredOverlaysAction,
	SetHoveredOverlayAction,
	SetSpecialObjectsActionStore
} from '@ansyn/overlays';
import { Action, select, Store } from '@ngrx/store';
import { IAppState } from '../app.effects.module';
import {
	areCoordinatesNumeric,
	BackToWorldView,
	CoreActionTypes,
	DisplayedOverlay,
	ICaseMapPosition,
	IContextEntity,
	IOverlay,
	IOverlaySpecialObject,
	IPendingOverlay,
	LayoutKey,
	layoutOptions,
	SetLayoutAction,
	SetLayoutSuccessAction,
	SetRemovedOverlaysIdAction,
	ToggleFavoriteAction,
	TogglePresetOverlayAction
} from '@ansyn/core';
import {
	IMapState,
	mapStateSelector,
	RemovePendingOverlayAction,
	selectActiveMapId,
	selectMapsList,
	SetPendingOverlaysAction
} from '@ansyn/map-facade';
import {
	BaseMapSourceProvider,
	CommunicatorEntity,
	IBaseMapSourceProviderConstructor,
	ImageryCommunicatorService,
	ProjectionService
} from '@ansyn/imagery';
import { catchError, filter, map, mergeMap, share, withLatestFrom } from 'rxjs/operators';
import { IContextParams, selectContextEntities, selectContextsParams, SetContextParamsAction } from '@ansyn/context';
import olExtent from 'ol/extent';
import * as turf from '@turf/turf';
import { transformScale } from '@turf/turf';
import { get } from 'lodash';
import { of } from 'rxjs/internal/observable/of';
import { selectHoveredOverlay, ChangeOverlayPreviewRotationAction } from '@ansyn/overlays';
import * as GeoJSON from 'geojson';
import { Point } from 'geojson';
import OLMap from 'ol/map';
import { forkJoin } from 'rxjs/index';
import { Observer } from 'rxjs/Observer';

@Injectable()
export class OverlaysAppEffects {

	@Effect()
	hoveredOverlayPreview$: Observable<any> = this.store$.pipe(select(selectHoveredOverlay)).pipe(
		withLatestFrom(this.store$.pipe(select(selectActiveMapId))),
		map(([overlay, activeMapId]: [IOverlay, string]) => [overlay, this.imageryCommunicatorService.provide(activeMapId)]),
		mergeMap(([overlay, comm]: [IOverlay, CommunicatorEntity]) => {
			return this.getCorrectedNorth(comm).pipe(
				catchError(() => of(0)),
				map((north) => {
					return north;
				})
			);
		}),
		map((north: number) => new ChangeOverlayPreviewRotationAction(north))
	);

	@Effect()
	displayLatestOverlay$: Observable<any> = this.actions$.pipe(
		ofType<SetFilteredOverlaysAction>(OverlaysActionTypes.SET_FILTERED_OVERLAYS),
		withLatestFrom(this.store$.select(selectContextsParams), this.store$.select(overlaysStateSelector)),
		filter(([action, params, { filteredOverlays }]: [SetFilteredOverlaysAction, IContextParams, IOverlaysState]) => params && params.defaultOverlay === DisplayedOverlay.latest && filteredOverlays.length > 0),
		mergeMap(([action, params, { filteredOverlays }]: [SetFilteredOverlaysAction, IContextParams, IOverlaysState]) => {
			const id = filteredOverlays[filteredOverlays.length - 1];
			return [
				new SetContextParamsAction({ defaultOverlay: null }),
				new DisplayOverlayFromStoreAction({ id })
			];
		}),
		share()
	);


	@Effect()
	displayTwoNearestOverlay$: Observable<any> = this.actions$.pipe(
		ofType<SetFilteredOverlaysAction>(OverlaysActionTypes.SET_FILTERED_OVERLAYS),
		withLatestFrom(this.store$.select(selectContextsParams), this.store$.select(overlaysStateSelector)),
		filter(([action, params, { filteredOverlays }]: [SetFilteredOverlaysAction, IContextParams, IOverlaysState]) => params && params.defaultOverlay === DisplayedOverlay.nearest && filteredOverlays.length > 0),
		mergeMap(([action, params, { overlays, filteredOverlays }]: [SetFilteredOverlaysAction, IContextParams, IOverlaysState]) => {
			const overlaysBeforeId = [...filteredOverlays].reverse().find(overlayId => overlays.get(overlayId).photoTime < params.time);
			const overlaysBefore = overlays.get(overlaysBeforeId);
			const overlaysAfterId = filteredOverlays.find(overlayId => overlays.get(overlayId).photoTime > params.time);
			const overlaysAfter = overlays.get(overlaysAfterId);
			const featureJson = get(params, 'contextEntities[0].featureJson');
			let extent;
			if (featureJson) {
				const featureJsonScale = transformScale(featureJson, 1.1);
				extent = olExtent.boundingExtent(featureJsonScale.geometry.coordinates[0]);
			}
			const payload = [{ overlay: overlaysBefore, extent }, {
				overlay: overlaysAfter,
				extent
			}].filter(({ overlay }) => Boolean(overlay));
			return [
				new DisplayMultipleOverlaysFromStoreAction(payload),
				new SetContextParamsAction({ defaultOverlay: null })
			];
		}),
		share()
	);

	@Effect()
	displayMultipleOverlays$: Observable<any> = this.actions$.pipe(
		ofType(OverlaysActionTypes.DISPLAY_MULTIPLE_OVERLAYS_FROM_STORE),
		filter((action: DisplayMultipleOverlaysFromStoreAction) => action.payload.length > 0),
		withLatestFrom(this.store$.select(mapStateSelector)),
		mergeMap(([action, { mapsList }]: [DisplayMultipleOverlaysFromStoreAction, IMapState]): any => {
			const validPendingOverlays = action.payload;
			/* theoretical situation */
			if (validPendingOverlays.length <= mapsList.length) {
				return validPendingOverlays.map((pendingOverlay: IPendingOverlay, index: number) => {
					let { overlay, extent } = pendingOverlay;
					let mapId = mapsList[index].id;
					return new DisplayOverlayAction({ overlay, mapId, extent });
				});
			}

			const layout = Array.from(layoutOptions.keys()).find((key: LayoutKey) => {
				const layout = layoutOptions.get(key);
				return layout.mapsCount === validPendingOverlays.length;
			});
			return [new SetPendingOverlaysAction(validPendingOverlays), new SetLayoutAction(layout)];
		})
	);

	@Effect()
	displayPendingOverlaysOnChangeLayoutSuccess$: Observable<any> = this.actions$.pipe(
		ofType(CoreActionTypes.SET_LAYOUT_SUCCESS),
		withLatestFrom(this.store$.select(mapStateSelector)),
		filter(([action, mapState]) => mapState.pendingOverlays.length > 0),
		mergeMap(([action, mapState]: [SetLayoutSuccessAction, IMapState]) => {
			return mapState.pendingOverlays.map((pendingOverlay: any, index: number) => {
				const { overlay, extent } = pendingOverlay;
				const mapId = mapState.mapsList[index].id;
				return new DisplayOverlayAction({ overlay, mapId, extent });
			});
		})
	);

	@Effect()
	removePendingOverlayOnDisplay$: Observable<any> = this.actions$.pipe(
		ofType(OverlaysActionTypes.DISPLAY_OVERLAY_SUCCESS),
		withLatestFrom(this.store$.select(mapStateSelector)),
		filter(([action, mapState]: [DisplayOverlaySuccessAction, IMapState]) => mapState.pendingOverlays.some((pending) => pending.overlay.id === action.payload.overlay.id)),
		map(([action, mapState]: [DisplayOverlaySuccessAction, IMapState]) => {
			return new RemovePendingOverlayAction(action.payload.overlay.id);
		})
	);

	@Effect()
	onDisplayOverlayFromStore$: Observable<DisplayOverlayAction> = this.actions$.pipe(
		ofType(OverlaysActionTypes.DISPLAY_OVERLAY_FROM_STORE),
		withLatestFrom(this.store$.select(overlaysStateSelector), this.store$.select(mapStateSelector)),
		map(([{ payload }, { overlays }, { activeMapId }]: [DisplayOverlayFromStoreAction, IOverlaysState, IMapState]) => {
			const mapId = payload.mapId || activeMapId;
			const overlay = overlays.get(payload.id);
			return new DisplayOverlayAction({ overlay, mapId, extent: payload.extent });
		})
	);

	@Effect()
	onSetRemovedOverlaysIdAction$: Observable<any> = this.actions$.pipe(
		ofType<SetRemovedOverlaysIdAction>(CoreActionTypes.SET_REMOVED_OVERLAY_ID),
		filter(({ payload }) => payload.value),
		withLatestFrom(this.store$.select(selectdisplayOverlayHistory), this.store$.select(selectMapsList)),
		mergeMap(([{ payload }, displayOverlayHistory, mapsList]) => {
			const mapActions = mapsList
				.filter((map) => map.data.overlay && (map.data.overlay.id === payload.id))
				.map((map) => {
					const mapId = map.id;
					const id = (displayOverlayHistory[mapId] || []).pop();
					if (Boolean(id)) {
						return new DisplayOverlayFromStoreAction({ mapId, id });
					}
					return new BackToWorldView({ mapId });
				});
			return [
				new ToggleFavoriteAction({ value: false, id: payload.id }),
				new TogglePresetOverlayAction({ value: false, id: payload.id }),
				...mapActions
			];
		})
	);


	private getOverlayFromDropMarkup = map(([markupMap, overlays]: [ExtendMap<MarkUpClass, IMarkUpData>, Map<any, any>]) =>
		overlays.get(markupMap && markupMap.get(MarkUpClass.hover).overlaysIds[0])
	);
	private getCommunicatorForActiveMap = map(([overlay, activeMapId]: [IOverlay, string]) => [overlay, this.imageryCommunicatorService.provide(activeMapId)]);
	private getPositionFromCommunicator = mergeMap(([overlay, communicator]: [IOverlay, CommunicatorEntity]) => {
		if (!communicator) {
			return Observable.of([overlay, null]);
		}
		return communicator.getPosition().map((position) => [overlay, position]);
	});
	private getOverlayWithNewThumbnail = mergeMap(([overlay, position]: [IOverlay, ICaseMapPosition]) => {
		if (!overlay) {
			return [overlay];
		}
		this.store$.dispatch(new SetHoveredOverlayAction({
			...overlay,
			thumbnailUrl: overlayOverviewComponentConstants.FETCHING_OVERLAY_DATA
		}));
		const sourceProvider = this.getSourceProvider(overlay.sourceType);
		return (<any>sourceProvider).getThumbnailUrl(overlay, position)
			.map(thumbnailUrl => ({ ...overlay, thumbnailUrl }))
			.catch(() => {
				return of(overlay);
			});
	});
	private getHoveredOverlayAction = map((overlay: IOverlay) => new SetHoveredOverlayAction(overlay));

	@Effect()
	setHoveredOverlay$: Observable<any> = this.store$.select(selectDropMarkup)
		.pipe(
			withLatestFrom(this.store$.select(selectOverlaysMap)),
			this.getOverlayFromDropMarkup,
			withLatestFrom(this.store$.select(selectActiveMapId)),
			this.getCommunicatorForActiveMap,
			this.getPositionFromCommunicator,
			this.getOverlayWithNewThumbnail,
			this.getHoveredOverlayAction
		)
		.pipe(
			catchError(err => {
				console.error(err);
				return Observable.of(err);
			})
		);

	@Effect()
	setSpecialObjectsFromContextEntities$: Observable<any> = this.store$.select(selectContextEntities).pipe(
		filter((contextEntities: IContextEntity[]) => Boolean(contextEntities)),
		map((contextEntities: IContextEntity[]): Action => {
			const specialObjects = contextEntities.map(contextEntity => ({
				id: contextEntity.id,
				date: contextEntity.date,
				shape: 'star'
			} as IOverlaySpecialObject));
			return new SetSpecialObjectsActionStore(specialObjects);
		})
	);

	getSourceProvider(sType) {
		return this.baseSourceProviders.find(({ constructor }) => sType === (<IBaseMapSourceProviderConstructor>constructor).sourceType);
	}

	getCorrectedNorth(communicator: CommunicatorEntity): Observable<number> {
		if (!communicator) {
			return of(0);
		}
		const { mapObject } = communicator.ActiveMap;
		return this.getProjectedCenters(mapObject).pipe(
			map((projectedCenters: Point[]): number => {
				const projectedCenterView = projectedCenters[0].coordinates;
				const projectedCenterViewWithOffset = projectedCenters[1].coordinates;
				const northOffsetRad = Math.atan2((projectedCenterViewWithOffset[0] - projectedCenterView[0]), (projectedCenterViewWithOffset[1] - projectedCenterView[1]));
				return northOffsetRad * -1;
			})
		);
	}

	getProjectedCenters(mapObject: OLMap): Observable<Point[]> {
		return Observable.create((observer: Observer<any>) => {
			const size = mapObject.getSize();
			const olCenterView = mapObject.getCoordinateFromPixel([size[0] / 2, size[1] / 2]);
			if (!areCoordinatesNumeric(olCenterView)) {
				observer.error('no coordinate for pixel');
			}
			const olCenterViewWithOffset = mapObject.getCoordinateFromPixel([size[0] / 2, (size[1] / 2) - 1]);
			if (!areCoordinatesNumeric(olCenterViewWithOffset)) {
				observer.error('no coordinate for pixel');
			}
			observer.next([olCenterView, olCenterViewWithOffset]);
		})
			.switchMap((centers: ol.Coordinate[]) => this.projectPoints(centers));
	}

	projectPoints(coordinates: ol.Coordinate[]): Observable<Point[]> {
		return forkJoin(coordinates.map((coordinate) => {
			const point = <GeoJSON.Point> turf.geometry('Point', coordinate);
			return this.projectionService.projectApproximatelyFromProjection(point, 'EPSG:3857');
		}));
	}

	constructor(public actions$: Actions,
				public store$: Store<IAppState>,
				public overlaysService: OverlaysService,
				@Inject(BaseMapSourceProvider) public baseSourceProviders: BaseMapSourceProvider[],
				public imageryCommunicatorService: ImageryCommunicatorService,
				public projectionService: ProjectionService) {
	}

}
