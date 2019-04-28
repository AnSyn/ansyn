import { fromCircle } from 'ol/geom/Polygon';
import { ImageryVisualizer, IVisualizerStyle } from '@ansyn/imagery';
import { uniq } from 'lodash';
import { FeatureCollection } from 'geojson';
import { select, Store } from '@ngrx/store';
import { MapFacadeService, selectActiveMapId, selectMapsList } from '@ansyn/map-facade';
import { combineLatest, Observable } from 'rxjs';
import { Inject } from '@angular/core';
import { distinctUntilChanged, filter, map, mergeMap, tap, withLatestFrom } from 'rxjs/operators';
import { AutoSubscription } from 'auto-subscriptions';
import { selectGeoFilterSearchMode } from '../../../../../status-bar/reducers/status-bar.reducer';
import { featureCollection } from '@turf/turf';
import {
	AnnotationMode,
	AnnotationsVisualizer,
	EntitiesVisualizer,
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
import { AnnotationSelectAction, SetAnnotationMode } from '../../../../../menu-items/tools/actions/tools.actions';
import { UpdateLayer } from '../../../../../menu-items/layers-manager/actions/layers.actions';
import { SearchMode, SearchModeEnum } from '../../../../../status-bar/models/search-mode.enum';
import { ICaseMapState } from '../../../../../menu-items/cases/models/case.model';
import { IOverlay } from '../../../../../overlays/models/overlay.model';

// @dynamic
@ImageryVisualizer({
	supported: [OpenLayersMap],
	deps: [Store, OpenLayersProjectionService, OL_PLUGINS_CONFIG],
	isHideable: true
})
export class AnsynAnnotationsVisualizer extends EntitiesVisualizer {
	annotationsVisualizer: AnnotationsVisualizer;

	activeAnnotationLayer$: Observable<ILayer> = combineLatest(
		this.store$.pipe(select(selectActiveAnnotationLayer)),
		this.store$.pipe(select(selectLayersEntities))
	).pipe(
		map(([activeAnnotationLayerId, entities]) => {
			return entities[activeAnnotationLayerId];
		})
	);

	currentOverlay$ = this.store$.pipe(
		select(selectMapsList),
		map((mapList) => MapFacadeService.mapById(mapList, this.mapId)),
		filter(Boolean),
		map((map: ICaseMapState) => map.data.overlay)
	);

	annotationFlag$ = this.store$.select(selectSubMenu).pipe(
		map((subMenu: SubMenuEnum) => subMenu === SubMenuEnum.annotations),
		distinctUntilChanged());

	isActiveMap$ = this.store$.select(selectActiveMapId).pipe(
		map((activeMapId: string): boolean => activeMapId === this.mapId),
		distinctUntilChanged()
	);

	annotationMode$: Observable<AnnotationMode> = this.store$.pipe(select(selectAnnotationMode));

	@AutoSubscription
	geoFilterSearchMode$ = this.store$.pipe(
		select(selectGeoFilterSearchMode),
		tap((searchMode: SearchMode) => {
			this.annotationsVisualizer.mapSearchIsActive = searchMode !== SearchModeEnum.none;
		})
	);

	@AutoSubscription
	annoatationModeChange$: Observable<any> = combineLatest(this.annotationMode$, this.isActiveMap$)
		.pipe(tap(([mode, isActiveMap]) => this.annotationsVisualizer.setMode(isActiveMap ? mode : null)));

	@AutoSubscription
	annotationPropertiesChange$: Observable<any> = this.store$.pipe(
		select(selectAnnotationProperties),
		tap((changes: Partial<IVisualizerStyle>) => this.updateStyle({ initial: { ...changes } }))
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
	onChangeMode$ = () => this.annotationsVisualizer.events.onChangeMode.pipe(
		tap((mode) => this.store$.dispatch(new SetAnnotationMode(mode)))
	);

	@AutoSubscription
	onSelect$ = () => this.annotationsVisualizer.events.onSelect.pipe(
		tap((event) => this.store$.dispatch(new AnnotationSelectAction(event)))
	);

	@AutoSubscription
	onDrawEnd$ = () => this.annotationsVisualizer.events.onDrawEnd.pipe(
		withLatestFrom(this.activeAnnotationLayer$, this.currentOverlay$),
		tap(([{ GeoJSON, feature }, activeAnnotationLayer, overlay]: [IDrawEndEvent, ILayer, IOverlay]) => {
			const [geoJsonFeature] = GeoJSON.features;
			const data = <FeatureCollection<any>>{ ...activeAnnotationLayer.data };
			data.features.push(geoJsonFeature);
			if (overlay) {
				geoJsonFeature.properties = {
					...geoJsonFeature.properties,
					...this.projectionService.getProjectionProperties(this.communicator, data, feature, overlay)
				};
			}
			geoJsonFeature.properties = { ...geoJsonFeature.properties };
			this.store$.dispatch(new UpdateLayer(<ILayer>{ ...activeAnnotationLayer, data }));
		})
	);

	onAnnotationsChange([entities, annotationFlag, selectedLayersIds, isActiveMap, activeAnnotationLayer]: [{ [key: string]: ILayer }, boolean, string[], boolean, string]): Observable<any> {
		const displayedIds = uniq(
			isActiveMap && annotationFlag ? [...selectedLayersIds, activeAnnotationLayer] : [...selectedLayersIds]
		)
			.filter((id: string) => entities[id] && entities[id].type === LayerType.annotation);

		const features = displayedIds.reduce((array, layerId) => [...array, ...entities[layerId].data.features], []);
		return this.annotationsVisualizer.showAnnotation(featureCollection(features));
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


