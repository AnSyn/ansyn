import { ImageryVisualizer, IVisualizerEntity, MarkerSize, VisualizerInteractionTypes } from '@ansyn/imagery';
import Draw from 'ol/interaction/Draw';
import olFeature from 'ol/Feature';
import GeometryType from 'ol/geom/GeometryType';
import { primaryAction as mouseClickCondition } from 'ol/events/condition'

import { EntitiesVisualizer, OpenLayersMap, OpenLayersProjectionService } from '@ansyn/ol';
import { select, Store } from '@ngrx/store';
import {
	ILayerState,
	selectLayerSearchPolygon,
	selectLayerSearchType
} from '../../../../menu-items/layers-manager/reducers/layers.reducer';
import { AutoSubscription } from 'auto-subscriptions';
import { LayerSearchTypeEnum } from '../../../../menu-items/layers-manager/models/layers.model';
import { tap, take, map, filter, mergeMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { FeatureCollection, Polygon } from 'geojson';
import { SetLayerSearchPolygon } from '../../../../menu-items/layers-manager/actions/layers.actions';

const interactionType: VisualizerInteractionTypes = <any>'layerSearchInteraction';
@ImageryVisualizer({
	supported: [OpenLayersMap],
	deps: [Store, OpenLayersProjectionService],
	isHideable: true,
	layerClassName: 'layer-search'
})
export class LayerSearchVisualizer extends EntitiesVisualizer {
	isHidden = true;

	@AutoSubscription
	drawPolygon$: Observable<boolean> = this.store.pipe(
		select(selectLayerSearchPolygon),
		filter(Boolean),
		mergeMap( (polygon: IVisualizerEntity) => {
			this.clearEntities();
			this.getInteraction(interactionType).setActive(false);
			// const entities = this.getEntitiesToDraw(polygon);
			return this.setEntities([polygon]);
		})
	);

	@AutoSubscription
	getLayerSearchType$: Observable<boolean> = this.store.pipe(
		select(selectLayerSearchType),
		map( (type) => type === LayerSearchTypeEnum.polygonView),
		tap( (isPolygon) => {
			this.setVisibility(isPolygon);
			this.getInteraction(interactionType).setActive(isPolygon);
			if (!isPolygon) {
				this.clearEntities();
			}
		})

	);
	constructor(protected store: Store, protected projectionService: OpenLayersProjectionService) {
		super({
			initial: {
				'stroke-width': 5,
				stroke: "#e44f22",
				'marker-size': MarkerSize.small,
				'marker-color': '#ffffff',
				'fill-opacity': 0
			}
		});
	}

	onInit() {
		super.onInit();
		this.initializeDrawInteraction();
	}

	initializeDrawInteraction() {
		const draw = new Draw(<any>{
			type: GeometryType.POLYGON,
			condition: mouseClickCondition,
			style: this.featureStyle.bind(this),
			minPoints: 2,
			geometryName: 'layer-search-bbox',
			source: this.source
		});
		draw.setActive(false);
		draw.on('drawstart', this.drawstart.bind(this));
		draw.on('drawend', this.drawend.bind(this));
		this.addInteraction(interactionType, draw)
	}

	drawstart() {
		this.clearEntities();
	}

	drawend({feature}) {
		this.projectionService
			.projectCollectionAccurately([feature], this.iMap.mapObject).pipe(
			take(1),
			tap((featureCollection: FeatureCollection<Polygon>) => {
				const featureJson = this.geometryToEntity('layerSearchPolygon', featureCollection.features[0].geometry);
				this.store.dispatch(new SetLayerSearchPolygon(featureJson))
			})
		).subscribe();
	}

	/*getEntitiesToDraw(polygon): IVisualizerEntity[] {
		const entities: IVisualizerEntity[] = [polygon];
		const
	}*/
}
