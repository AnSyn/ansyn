import { EntitiesVisualizer } from '../entities-visualizer';
import Select from 'ol/interaction/select';
import condition from 'ol/events/condition';
import Style from 'ol/style/style';
import Vector from 'ol/layer/vector';
import * as SourceVector from 'ol/source/vector'
import Stroke from 'ol/style/stroke';
import MultiPolygon from 'ol/geom/multipolygon';
import Feature from 'ol/feature';
import { IMap } from '../../imagery/model/imap';
import { IVisualizerEntity } from '../../imagery/model/imap-visualizer';
import {cloneDeep as _cloneDeep} from 'lodash';
export const FootprintPolylineVisualizerType = 'FootprintPolylineVisualizer';

export const polygonStyles = {
	staticPolygon: new Style({
		stroke: new Stroke({
			color: '#bd0fe2',
			width: 5
		}),
		fill: undefined
	})
};

export class FootprintPolylineVisualizer extends EntitiesVisualizer {

	selectPointerMove: Select;
	hoverLayerSource;
	hoverLayer: Vector;

	constructor(args: any) {
		super(FootprintPolylineVisualizerType, args);
		this.fillColor = 'transparent';
		this.strokeColor = 'rgb(211, 147, 225)';
		this.containerLayerOpacity = 0.5;
	}

	onInit(mapId: string, map: IMap) {
		super.onInit(mapId, map);
		this.hoverLayerSource = new SourceVector.default();
		this.hoverLayer = new Vector({source: this.hoverLayerSource, zIndex:10000000000000 });

		this._imap.mapObject.addLayer(this.hoverLayer);

		this.selectPointerMove = new Select({
			condition: condition.pointerMove,
			style: (feature, resolution) => {
				return polygonStyles.staticPolygon
			},
			layers: [this._footprintsVector],
			hitTolerance: 0
		});

		map.mapObject.addInteraction(this.selectPointerMove);

		this.selectPointerMove.on('select', ($event) => {
			let selected = $event.selected;
			if(selected.length > 0) {
				const a = selected[0];
				const a_id_ = a.id_;
				let hoverFeature = this.hoverLayerSource.getFeatureById(a_id_);
				if (!hoverFeature || hoverFeature.getId() !== a_id_) {
					this.hoverLayerSource.clear();
					const c = [[...a.getGeometry().getCoordinates()]];
					hoverFeature = new Feature(new MultiPolygon(c));
					hoverFeature .setId(a_id_);
					this.hoverLayerSource.addFeature(hoverFeature);
					this.onHoverFeature.emit(a_id_);
				}
			} else {
				this.onHoverFeature.emit();
				this.hoverLayerSource.clear();
			}


		});
	}

	addOrUpdateEntities(logicalEntities: IVisualizerEntity[]) {
		const conversion = this.convertPolygonToPolyline(logicalEntities);
		super.addOrUpdateEntities(conversion);
	}

	convertPolygonToPolyline(logicalEntities: IVisualizerEntity[]): IVisualizerEntity[] {
		const clonedLogicalEntities = _cloneDeep(logicalEntities);
		clonedLogicalEntities.forEach((entity: IVisualizerEntity) => {
			let geometry: GeoJSON.MultiLineString = entity.featureJson.geometry;
			geometry.type = 'MultiLineString';
			geometry.coordinates = <any> geometry.coordinates[0];
		});
		return clonedLogicalEntities;
	}

}



// const dblClickInteraction = map.mapObject.getInteraction().getArray().find((interaction) => {
// 	if (interaction instanceof ol.interaction.DoubleClickZoom) {
// 		dblClickInteraction = interaction;
// 	}
// });
// // remove from map
// map.removeInteraction(dblClickInteraction);
//
// this.selectPointerMove.on('select', (evt) => {
// 	this.onHitFeature.emit(evt.selected.id_)
// })
