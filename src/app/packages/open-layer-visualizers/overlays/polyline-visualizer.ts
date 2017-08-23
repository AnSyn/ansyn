import { EntitiesVisualizer } from '../entities-visualizer';
import Select from 'ol/interaction/select';
import condition from 'ol/events/condition';
import Style from 'ol/style/style';
import Vector from 'ol/layer/vector';
import SourceVector from 'ol/source/vector'
import Stroke from 'ol/style/stroke';
import MultiPolygon from 'ol/geom/multipolygon';
import Feature from 'ol/feature';
import { IVisualizerEntity } from '../../imagery/model/imap-visualizer';
import {cloneDeep as _cloneDeep} from 'lodash';
export const FootprintPolylineVisualizerType = 'FootprintPolylineVisualizer';

export const polylineStyles = {
	staticPolyline: new Style({
		stroke: new Stroke({
			color: '#bd0fe2',
			width: 5
		}),
	})
};

export class FootprintPolylineVisualizer extends EntitiesVisualizer {
	hoverLayerSource;
	hoverLayer: Vector;

	constructor(args: any) {
		super(FootprintPolylineVisualizerType, args);
		this.fillColor = 'transparent';
		this.strokeColor = 'rgb(211, 147, 225)';
		this.containerLayerOpacity = 0.5;
	}

	createLayer() {
		super.createLayer();
		this.initHoverPolygonLayer();
		this.addSelectInteraction();
	}

	initHoverPolygonLayer() {
		this.hoverLayerSource = new SourceVector();
		this.hoverLayer = new Vector({source: this.hoverLayerSource});
		this._imap.mapObject.addLayer(this.hoverLayer);
	}

	addSelectInteraction() {
		const selectPointerMove: Select = new Select({
			condition: condition.pointerMove,
			style: (feature, resolution) => polylineStyles.staticPolyline,
			layers: [this._footprintsVector]
		});
		selectPointerMove.on('select', this.onSelectFeature.bind(this));
		this._imap.mapObject.addInteraction(selectPointerMove);
	}

	onSelectFeature($event) {
		if($event.selected.length > 0) {
			const selectedFeature = $event.selected[0];
			const selectedFeatureId = selectedFeature.id_;
			let hoverFeature = this.hoverLayerSource.getFeatureById(selectedFeatureId);

			if (!hoverFeature || hoverFeature.getId() !== selectedFeatureId ) {
				this.hoverLayerSource.clear();
				const selectedFeatureCoordinates = [[...selectedFeature.getGeometry().getCoordinates()]];
				hoverFeature = new Feature(new MultiPolygon(selectedFeatureCoordinates));
				hoverFeature .setId(selectedFeatureId);
				this.hoverLayerSource.addFeature(hoverFeature);
				this.onHoverFeature.emit(selectedFeatureId);
			}
		} else {
			this.onHoverFeature.emit();
			this.hoverLayerSource.clear();
		}
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
