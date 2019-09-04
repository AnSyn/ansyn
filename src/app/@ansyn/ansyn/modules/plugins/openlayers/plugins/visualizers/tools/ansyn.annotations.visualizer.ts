import { BaseImageryPlugin, ImageryPlugin, IVisualizerEntity, IVisualizerStyle } from '@ansyn/imagery';
import { uniq } from 'lodash';
import { select, Store } from '@ngrx/store';
import { selectActiveMapId, selectOverlayFromMap } from '@ansyn/map-facade';
import { combineLatest, Observable } from 'rxjs';
import { Inject } from '@angular/core';
import { distinctUntilChanged, map, mergeMap, tap, withLatestFrom } from 'rxjs/operators';
import { AutoSubscription } from 'auto-subscriptions';
import { selectGeoFilterSearchMode } from '../../../../../status-bar/reducers/status-bar.reducer';
import { featureCollection, FeatureCollection } from '@turf/turf';
import {
	AnnotationMode,
	AnnotationsVisualizer,
	IDrawEndEvent,
	IOLPluginsConfig,
	OL_PLUGINS_CONFIG,
	OpenLayersMap,
	OpenLayersProjectionService
} from '@ansyn/ol';
import { ILayer, LayerType } from '../../../../../menu-items/layers-manager/models/layers.model';
import {
	selectActiveAnnotationLayer,
	selectLayersEntities,
	selectSelectedLayersIds
} from '../../../../../menu-items/layers-manager/reducers/layers.reducer';
import {
	selectAnnotationMode,
	selectAnnotationProperties,
	selectSubMenu,
	SubMenuEnum
} from '../../../../../menu-items/tools/reducers/tools.reducer';
import {
	AnnotationRemoveFeature,
	AnnotationUpdateFeature,
	SetAnnotationMode
} from '../../../../../menu-items/tools/actions/tools.actions';
import { UpdateLayer } from '../../../../../menu-items/layers-manager/actions/layers.actions';
import { SearchMode, SearchModeEnum } from '../../../../../status-bar/models/search-mode.enum';
import { IOverlaysTranslationData } from '../../../../../menu-items/cases/models/case.model';
import { IOverlay } from '../../../../../overlays/models/overlay.model';
import { selectTranslationData } from '../../../../../overlays/overlay-status/reducers/overlay-status.reducer';
import { SetOverlayTranslationDataAction } from '../../../../../overlays/overlay-status/actions/overlay-status.actions';

// @dynamic
@ImageryPlugin({
	supported: [OpenLayersMap],
	deps: [Store, OpenLayersProjectionService, OL_PLUGINS_CONFIG]
})
export class AnsynAnnotationsVisualizer extends BaseImageryPlugin {
	annotationsVisualizer: AnnotationsVisualizer;
	overlay: IOverlay;

	activeAnnotationLayer$: Observable<ILayer> = combineLatest(
		this.store$.pipe(select(selectActiveAnnotationLayer)),
		this.store$.pipe(select(selectLayersEntities))
	).pipe(
		map(([activeAnnotationLayerId, entities]) => {
			return entities[activeAnnotationLayerId];
		})
	);

	get offset() {
		return this.annotationsVisualizer.offset;
	}

	set offset(offset: [number, number]) {
		this.annotationsVisualizer.offset = offset;
	}

	annotationFlag$ = this.store$.select(selectSubMenu).pipe(
		map((subMenu: SubMenuEnum) => subMenu === SubMenuEnum.annotations),
		distinctUntilChanged());

	isActiveMap$ = this.store$.select(selectActiveMapId).pipe(
		map((activeMapId: string): boolean => activeMapId === this.mapId),
		distinctUntilChanged()
	);

	annotationMode$: Observable<AnnotationMode> = this.store$.pipe(select(selectAnnotationMode));

	@AutoSubscription
	activeChange$ = this.store$.pipe(
		select(selectActiveMapId),
		tap((activeMapId) => {
			if (activeMapId !== this.mapId) {
				this.annotationsVisualizer.events.onSelect.next([]);
				this.annotationsVisualizer.events.onHover.next(null);
			}
		})
	);

	@AutoSubscription
	geoFilterSearchMode$ = this.store$.pipe(
		select(selectGeoFilterSearchMode),
		tap((searchMode: SearchMode) => {
			this.annotationsVisualizer.mapSearchIsActive = searchMode !== SearchModeEnum.none;
		})
	);

	@AutoSubscription
	annoatationModeChange$: Observable<any> = this.annotationMode$
		.pipe(tap((mode) => {
			this.annotationsVisualizer.setMode(mode)
		}));

	@AutoSubscription
	annotationPropertiesChange$: Observable<any> = this.store$.pipe(
		select(selectAnnotationProperties),
		tap((changes: Partial<IVisualizerStyle>) => this.annotationsVisualizer.updateStyle({ initial: { ...changes } }))
	);

	@AutoSubscription
	onAnnotationsChange$ = combineLatest(
		this.store$.pipe(select(selectLayersEntities)),
		this.annotationFlag$,
		this.store$.select(selectSelectedLayersIds),
		this.isActiveMap$,
		this.store$.select(selectActiveAnnotationLayer)
	).pipe(
		mergeMap(this.onAnnotationsChange.bind(this))
	);

	@AutoSubscription
	currentOverlay$ = () => this.store$.pipe(
		select(selectOverlayFromMap(this.mapId)),
		tap(overlay => this.overlay = overlay)
	);

	@AutoSubscription
	onChangeMode$ = () => this.annotationsVisualizer.events.onChangeMode.pipe(
		tap((mode) => {
			const newMode = !Boolean(mode) ? undefined : mode; // prevent infinite loop
			this.store$.dispatch(new SetAnnotationMode(newMode))
		})
	);

	@AutoSubscription
	onDrawEnd$ = () => this.annotationsVisualizer.events.onDrawEnd.pipe(
		withLatestFrom(this.activeAnnotationLayer$),
		tap(([{ GeoJSON, feature }, activeAnnotationLayer]: [IDrawEndEvent, ILayer]) => {
			const [geoJsonFeature] = GeoJSON.features;
			const data = <FeatureCollection<any>>{ ...activeAnnotationLayer.data };
			data.features.push(geoJsonFeature);
			if (this.overlay) {
				geoJsonFeature.properties = {
					...geoJsonFeature.properties,
					...this.projectionService.getProjectionProperties(this.communicator, data, feature, this.overlay)
				};
			}
			geoJsonFeature.properties = { ...geoJsonFeature.properties };
			this.store$.dispatch(new UpdateLayer(<ILayer>{ ...activeAnnotationLayer, data }));
		})
	);

	@AutoSubscription
	getOffsetFromCase$ = () => combineLatest(this.store$.select(selectTranslationData), this.store$.select(selectOverlayFromMap(this.mapId))).pipe(
		tap(([translationData, overlay]: [IOverlaysTranslationData, IOverlay]) => {
			if (overlay && translationData[overlay.id] && translationData[overlay.id].offset) {
				this.offset = translationData[overlay.id].offset;
			} else {
				this.offset = [0, 0];
			}
			this.annotationsVisualizer.onResetView().subscribe();
		})
	);

	@AutoSubscription
	removeEntity$ = () => this.annotationsVisualizer.events.removeEntity.pipe(
		tap((featureId) => {
			this.store$.dispatch(new AnnotationRemoveFeature(featureId));
		})
	);


	@AutoSubscription
	updateEntity$ = (): Observable<IVisualizerEntity> => this.annotationsVisualizer.events.updateEntity.pipe(
		tap((feature) => {
			this.store$.dispatch(new AnnotationUpdateFeature({
				featureId: feature.id,
				properties: { ...feature }
			}));
		})
	);

	onDraggEnd$ = () => this.annotationsVisualizer.events.offsetEntity.pipe(
		tap((offset: any) => {
			if (this.overlay) {
				this.store$.dispatch(new SetOverlayTranslationDataAction({
					overlayId: this.overlay.id, offset
				}));
			}
		})
	);

	onAnnotationsChange([entities, annotationFlag, selectedLayersIds, isActiveMap, activeAnnotationLayer]: [{ [key: string]: ILayer }, boolean, string[], boolean, string]): Observable<any> {
		const displayedIds = uniq(
			isActiveMap && annotationFlag ? [...selectedLayersIds, activeAnnotationLayer] : [...selectedLayersIds]
		)
			.filter((id: string) => entities[id] && entities[id].type === LayerType.annotation);

		const features = displayedIds.reduce((array, layerId) => [...array, ...entities[layerId].data.features], []);
		return this.showAnnotation(featureCollection(features));
	}

	showAnnotation(annotationsLayer): Observable<any> {
		const annotationsLayerEntities = this.annotationsVisualizer.annotationsLayerToEntities(annotationsLayer);
		this.annotationsVisualizer.getEntities()
			.filter(({ id }) => !annotationsLayerEntities.some((entity) => id === entity.id))
			.forEach(({ id }) => this.annotationsVisualizer.removeEntity(id, true));

		const entitiesToAdd = annotationsLayerEntities
			.filter((entity) => {
				const oldEntity = this.annotationsVisualizer.idToEntity.get(entity.id);
				if (oldEntity) {
					const isShowMeasuresDiff = oldEntity.originalEntity.showMeasures !== entity.showMeasures;
					const isLabelDiff = oldEntity.originalEntity.label !== entity.label;
					const isFillDiff = oldEntity.originalEntity.style.initial.fill !== entity.style.initial.fill;
					const isStrokeWidthDiff = oldEntity.originalEntity.style.initial['stroke-width'] !== entity.style.initial['stroke-width'];
					const isStrokeDiff = oldEntity.originalEntity.style.initial['stroke'] !== entity.style.initial['stroke'];
					const isOpacityDiff = ['fill-opacity', 'stroke-opacity'].filter((o) => oldEntity.originalEntity.style.initial[o] !== entity.style.initial[o]);
					return isShowMeasuresDiff || isLabelDiff || isFillDiff || isStrokeWidthDiff || isStrokeDiff || isOpacityDiff;
				}
				return true;
			});
		return this.annotationsVisualizer.addOrUpdateEntities(entitiesToAdd);
	}

	constructor(public store$: Store<any>,
				protected projectionService: OpenLayersProjectionService,
				@Inject(OL_PLUGINS_CONFIG) protected olPluginsConfig: IOLPluginsConfig) {
		super();
	}

	onInit() {
		super.onInit();
		this.annotationsVisualizer = this.communicator.getPlugin(AnnotationsVisualizer);
	}

}


