import { Observable, of, combineLatest } from 'rxjs';
import { Actions } from '@ngrx/effects';
import { Store, select } from '@ngrx/store';
import { ImageryPlugin } from '@ansyn/imagery';

import { CesiumMap, CesiumProjectionService, BaseEntitiesVisualizer, CesiumDrawAnnotationsVisualizer } from '@ansyn/imagery-cesium';
import { LoggerService } from '../../../core/services/logger.service';
import { AutoSubscription } from 'auto-subscriptions';
import { tap, filter, map, mergeMap, distinctUntilChanged, switchMap, withLatestFrom } from 'rxjs/operators';
import { selectAnnotationMode, selectSubMenu, SubMenuEnum } from '../../../menu-items/tools/reducers/tools.reducer';
import {
	selectLayersEntities,
	selectActiveAnnotationLayer,
	selectSelectedLayersIds,
} from '../../../menu-items/layers-manager/reducers/layers.reducer';
import { ILayer, LayerType, ILayerDictionary } from '../../../menu-items/layers-manager/models/layers.model';
import { selectActiveMapId } from '@ansyn/map-facade';
import { uniq } from 'lodash';
import { featureCollection } from '@turf/turf';
import { UpdateLayer } from '../../../menu-items/layers-manager/actions/layers.actions';
import { FeatureCollection } from 'geojson';
import { checkEntitiesDiff } from '../../utils/annotations-visualizers';
import { SetAnnotationMode } from '../../../menu-items/tools/actions/tools.actions';

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

	onAnnotationsChange$ = combineLatest(
		this.store.pipe(select(selectLayersEntities)),
		this.isAnnotationSubMenuOpen$,
		this.store.select(selectSelectedLayersIds),
		this.isActiveMap$,
		this.store.select(selectActiveAnnotationLayer)
	).pipe(mergeMap((resultArray) => this.renderEntities(...resultArray)));

	@AutoSubscription
	renderEntities$ = this.isReady$.pipe(switchMap(() => this.onAnnotationsChange$));

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
				this.store.dispatch(
					new UpdateLayer({
						id: activeAnnotationLayer.id,
						data,
					})
				);

				this.store.dispatch(
					new SetAnnotationMode({
						annotationMode: undefined
					})
				);
			})
		);

	constructor(protected actions: Actions, public loggerService: LoggerService, public store: Store<any>) {
		super();
	}

	renderEntities(
		layers: ILayerDictionary,
		isAnnotationSubMenuOpen: boolean,
		selectedLayersIds: string[],
		isActiveMap: boolean,
		activeAnnotationLayerId: string
	): Observable<boolean> {
		const displayedLayersIds = uniq(
			isActiveMap && isAnnotationSubMenuOpen ? [...selectedLayersIds, activeAnnotationLayerId] : [...selectedLayersIds]
		).filter((id: string) => layers[id] && layers[id].type === LayerType.annotation);

		const features = displayedLayersIds.reduce((array, layerId) => [...array, ...layers[layerId].data.features], []);
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
				return checkEntitiesDiff(oldEntity.originalEntity, entity);
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
