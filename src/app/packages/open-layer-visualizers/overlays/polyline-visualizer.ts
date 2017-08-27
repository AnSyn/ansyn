import { EntitiesVisualizer } from '../entities-visualizer';
import Select from 'ol/interaction/select';
import condition from 'ol/events/condition';
import Style from 'ol/style/style';
import Vector from 'ol/layer/vector';
import SourceVector from 'ol/source/vector'
import Stroke from 'ol/style/stroke';
import Fill from 'ol/style/fill';
import MultiPolygon from 'ol/geom/multipolygon';
import Feature from 'ol/feature';
import { IVisualizerEntity } from '../../imagery/model/imap-visualizer';
import {cloneDeep as _cloneDeep, get as _get, isNil as _isNil} from 'lodash';
import { IMap } from '../../imagery/model/imap';
export const FootprintPolylineVisualizerType = 'FootprintPolylineVisualizer';


export class FootprintPolylineVisualizer extends EntitiesVisualizer {
	hoverLayerSource;
	hoverLayer: Vector;

	strokeColors = {
		active: `#27b2cf`,
		displayed: `#9524ad`,
		hover: `rgb(211, 147, 225)`,
		undefined: `rgb(211, 147, 225)`
	};

	hoverStrokeColors = {
		active: `#27b2cf`,
		displayed: `#bd0fe2`,
		hover: `#bd0fe2`,
		undefined: `#bd0fe2`
	};

	interactionsStyle =  new Style({
		stroke: new Stroke({
			color: 'transparent',
			width: 5
		})
	});

	constructor(args: any) {
		super(FootprintPolylineVisualizerType, args);
		this.fillColor = 'transparent';
		this.strokeColor = 'rgb(211, 147, 225)';
		this.containerLayerOpacity = 0.5;
	}

	onInit(mapId: string, map: IMap) {
		super.onInit(mapId, map);
		this.initHoverPolygonLayer();
		this.subscribers.push(this.syncHoverFeature.subscribe(this.onSyncHoverFeature.bind(this)));
	}

	createLayer() {
		super.createLayer();
		this.addSelectInteraction();
		this.addDoubleClickInteraction();

	}

	initHoverPolygonLayer() {
		this.hoverLayerSource = new SourceVector();
		this.hoverLayer = new Vector({
			source: this.hoverLayerSource,
			style: (feature: Feature) => {
				const markClass = this.getMarkClass(feature.getId());
				const color = this.hoverStrokeColors[markClass];
				return new Style({
					stroke: new Stroke({
						width: 5,
						color
					}),
					fill: new Fill({color: 'rgba(255,255,255,0.4)'})
				});
			}
		});
		this.hoverLayer.setZIndex(1000);
		this._imap.mapObject.addLayer(this.hoverLayer);
	}

	getMarkClass(featureId): string | undefined  {
		const mark = this.markups.find( ({id}) => id === featureId);
		return <string | undefined> _get(mark, 'class');
	}

	addSelectInteraction() {
		const selectPointerMove: Select = new Select({
			condition: condition.pointerMove,
			style: () => this.interactionsStyle,
			layers: [this._footprintsVector]
		});
		selectPointerMove.on('select', this.onSelectFeature.bind(this));
		this._imap.mapObject.addInteraction(selectPointerMove);
	}

	addDoubleClickInteraction() {
		const selectPointerMove: Select = new Select({
			condition: condition.doubleClick,
			style: () => this.interactionsStyle,
			layers: [this._footprintsVector]
		});
		selectPointerMove.on('select', this.onDoubleClickFeature.bind(this));
		this._imap.mapObject.addInteraction(selectPointerMove);
	}

	onSelectFeature($event) {
		if($event.selected.length > 0) {
			const selectedFeatureId = $event.selected[0].getId()
			const hoverFeature = this.hoverLayerSource.getFeatureById(selectedFeatureId);
			if (!hoverFeature || hoverFeature.getId() !== selectedFeatureId) {
				this.onHoverFeature.emit(selectedFeatureId);
			}
		} else {
			this.onHoverFeature.emit();
		}
	}

	onDoubleClickFeature($event) {
		if($event.selected.length > 0) {
			const selectedFeature = $event.selected[0];
			this.doubleClickFeature.emit(selectedFeature.getId());
		}
	}



	createHoverFeature(selectedFeature): void {
		this.hoverLayerSource.clear();
		const selectedFeatureCoordinates = [[...selectedFeature.getGeometry().getCoordinates()]];
		const hoverFeature = new Feature(new MultiPolygon(selectedFeatureCoordinates));
		hoverFeature.setId(selectedFeature.getId());
		this.hoverLayerSource.addFeature(hoverFeature);
	}

	addOrUpdateEntities(logicalEntities: IVisualizerEntity[]) {
		const conversion = this.convertPolygonToPolyline(logicalEntities);
		super.addOrUpdateEntities(conversion);
	}

	convertPolygonToPolyline(logicalEntities: IVisualizerEntity[]): IVisualizerEntity[] {
		const clonedLogicalEntities = _cloneDeep(logicalEntities);
		clonedLogicalEntities
			.filter((entity: IVisualizerEntity) => entity.featureJson.geometry.type === 'MultiPolygon')
			.forEach((entity: IVisualizerEntity) => {
				let geometry: GeoJSON.MultiLineString = entity.featureJson.geometry;
				geometry.type = 'MultiLineString';
				geometry.coordinates = <any> geometry.coordinates[0];
			});
		return clonedLogicalEntities;
	}

	onSyncHoverFeature(id) {
		if(_isNil(id)) {
			this.hoverLayerSource.clear();
		} else {
			const polyline = this._source.getFeatureById(id);
			if (!_isNil(polyline)) {
				this.createHoverFeature(polyline);
			}
		}
	}

	featureStyle(feature: Feature, resolution?) {
		const markClass = this.getMarkClass(feature.getId());
		return new Style({
			stroke: new Stroke({
				color: this.strokeColors[markClass],
				width: 3
			})
		})
	}
	onMarkupFeatures(markup) {
		super.onMarkupFeatures(markup);
		this.hoverLayerSource.refresh();
		if (this._source) {
			this._source.refresh();
		}
	}


}
