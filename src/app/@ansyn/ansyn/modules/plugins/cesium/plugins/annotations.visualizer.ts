import { Observable, of, combineLatest } from "rxjs";
import { Actions, ofType } from "@ngrx/effects";
import { Store, select } from "@ngrx/store";
import { ImageryPlugin } from "@ansyn/imagery";

import { CesiumMap, CesiumProjectionService, BaseEntitiesVisualizer, CesiumDrawAnnotationsVisualizer } from "@ansyn/imagery-cesium";
import { LoggerService } from "../../../core/services/logger.service";
import { AutoSubscription } from "auto-subscriptions";
import { tap, take, filter, map, mergeMap, distinctUntilChanged, switchMap, withLatestFrom } from "rxjs/operators";
import { selectAnnotationMode, selectSubMenu, SubMenuEnum } from "../../../menu-items/tools/reducers/tools.reducer";
import {
	selectLayersEntities,
	selectActiveAnnotationLayer,
	selectSelectedLayersIds,
} from "../../../menu-items/layers-manager/reducers/layers.reducer";
import { ILayer, LayerType } from "../../../menu-items/layers-manager/models/layers.model";
import { selectActiveMapId } from "@ansyn/map-facade";
import { uniq } from "lodash";
import { featureCollection } from "@turf/turf";
import { UpdateLayer } from "../../../menu-items/layers-manager/actions/layers.actions";
import { FeatureCollection } from "geojson";

@ImageryPlugin({
	supported: [CesiumMap],
	deps: [Actions, LoggerService, Store, CesiumProjectionService],
})
export class AnnotationsVisualizer extends BaseEntitiesVisualizer {
	private cesiumDrawer: CesiumDrawAnnotationsVisualizer;

	@AutoSubscription
	annoatationModeChange$ = this.store.select(selectAnnotationMode).pipe(
		filter((mode) => !!mode),
		tap((annotationMode) => {
			this.cesiumDrawer.startDrawing(annotationMode as any);
		})
	);

	isActiveMap$ = this.store.select(selectActiveMapId).pipe(
		map((activeMapId: string): boolean => activeMapId === this.mapId),
		distinctUntilChanged()
	);

	isAnnotationSubMenuOpen$ = this.store.select(selectSubMenu).pipe(
		map((subMenu: SubMenuEnum) => subMenu === SubMenuEnum.annotations),
		distinctUntilChanged()
	);

	onCesiumDrawerReady$ = of(this.isReady).pipe(
		mergeMap((isReady) => (isReady ? of(isReady) : this.isReady$.asObservable())),
		take(1)
	);

	onAnnotationsChange$ = combineLatest(
		this.store.pipe(select(selectLayersEntities)),
		this.isAnnotationSubMenuOpen$,
		this.store.select(selectSelectedLayersIds),
		this.isActiveMap$,
		this.store.select(selectActiveAnnotationLayer)
	).pipe(mergeMap((resultArray) => this.renderEntities(...resultArray)));

	@AutoSubscription
	renderEntities$ = this.onCesiumDrawerReady$.pipe(switchMap(() => this.onAnnotationsChange$));

	activeAnnotationLayer$: Observable<ILayer> = combineLatest(
		this.store.pipe(select(selectActiveAnnotationLayer)),
		this.store.pipe(select(selectLayersEntities))
	).pipe(
		map(([activeAnnotationLayerId, entities]) => {
			return entities[activeAnnotationLayerId];
		})
	);

	@AutoSubscription
	onDrawEnd$ = () =>
		this.cesiumDrawer.events.onDrawEnd.pipe(
			withLatestFrom(this.activeAnnotationLayer$),
			tap(([GeoJSON, activeAnnotationLayer]: [FeatureCollection<any>, ILayer]) => {
				const data = <FeatureCollection<any>>{
					...activeAnnotationLayer.data,
					features: activeAnnotationLayer.data.features.concat(GeoJSON.features),
				};
				// TODO - display overlays with cesium
				// if (this.overlay) {
				// 	GeoJSON.features[0].properties = {
				// 		...GeoJSON.features[0].properties,
				// 		...this.projectionService.getProjectionProperties(this.communicator, data, feature, this.overlay)
				// 	};
				// }
				this.store.dispatch(
					new UpdateLayer({
						id: activeAnnotationLayer.id,
						data,
					})
				);
			})
		);

	constructor(protected actions: Actions, public loggerService: LoggerService, public store: Store<any>) {
		super();
	}

	renderEntities(
		entities: {
			[key: string]: ILayer;
		},
		isAnnotationSubMenuOpen: boolean,
		selectedLayersIds: string[],
		isActiveMap: boolean,
		activeAnnotationLayer: string
	): Observable<boolean> {
		const displayedIds = uniq(
			isActiveMap && isAnnotationSubMenuOpen ? [...selectedLayersIds, activeAnnotationLayer] : [...selectedLayersIds]
		).filter((id: string) => entities[id] && entities[id].type === LayerType.annotation);

		const features = displayedIds.reduce((array, layerId) => [...array, ...entities[layerId].data.features], []);
		return this.showAnnotation(featureCollection(features) as FeatureCollection);
	}

	showAnnotation(annotationsLayer: FeatureCollection<any>): Observable<boolean> {
		const annotationsLayerEntities = this.annotationsLayerToEntities(annotationsLayer);
		this.getEntities()
			.filter(({ id }) => !annotationsLayerEntities.some((entity) => id === entity.id))
			.forEach(({ id }) => this.removeEntity(id));

		const entitiesToAdd = annotationsLayerEntities.filter((entity) => {
			const oldEntity = this.idToEntity.get(entity.id);
			if (oldEntity) {
				const isShowMeasuresDiff = oldEntity.originalEntity.showMeasures !== entity.showMeasures;
				const isShowAreaDiff = oldEntity.originalEntity.showArea !== entity.showArea;
				const isLabelDiff = oldEntity.originalEntity.label !== entity.label;
				const isFillDiff = oldEntity.originalEntity.style.initial.fill !== entity.style.initial.fill;
				const isStrokeWidthDiff = oldEntity.originalEntity.style.initial["stroke-width"] !== entity.style.initial["stroke-width"];
				const isStrokeDiff = oldEntity.originalEntity.style.initial["stroke"] !== entity.style.initial["stroke"];
				const isOpacityDiff = ["fill-opacity", "stroke-opacity"].filter(
					(o) => oldEntity.originalEntity.style.initial[o] !== entity.style.initial[o]
				);
				return isShowMeasuresDiff || isLabelDiff || isFillDiff || isStrokeWidthDiff || isStrokeDiff || isOpacityDiff || isShowAreaDiff;
			}
			return true;
		});
		return this.addOrUpdateEntities(entitiesToAdd);
	}

	onInit() {
		super.onInit();
		this.cesiumDrawer = this.communicator.getPlugin(CesiumDrawAnnotationsVisualizer);
	}

	onResetView(): Observable<boolean> {
		return of(true);
	}
}
