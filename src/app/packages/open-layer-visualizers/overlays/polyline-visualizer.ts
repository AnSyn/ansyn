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
import { IMarkupEvent, IVisualizerEntity } from '@ansyn/imagery/model/imap-visualizer';
import {cloneDeep as _cloneDeep, isNil as _isNil} from 'lodash';
import { IMap } from '@ansyn/imagery/model/imap';

export const FootprintPolylineVisualizerType = 'FootprintPolylineVisualizer';

export class FootprintPolylineVisualizer extends EntitiesVisualizer {
	hoverLayerSource: SourceVector;
	hoverLayer: Vector;
	selectPointerMove: Select;
	selectDoubleClick: Select;

	styleProperties = {
		hoverFeature: {
			stroke: {
				colors: {
					active: `#27b2cf`,
					displayed: `#9524ad`,
					hover: `#9524ad`,
					favorites: 'yellow',
					'': `#9524ad`
				},
				width: 5
			},
			fill: new Fill({color: 'rgba(255,255,255,0.4)'})
		},
		staticFeature: {
			stroke: {
				colors: {
					active: `#27b2cf`,
					displayed: `rgb(211, 147, 225)`,
					hover: `rgb(211, 147, 225)`,
					favorites: 'yellow',
					'': `rgb(211, 147, 225)`
				},
				width: 3
			}
		}
	};

	interactionsStyle =  new Style({
		stroke: new Stroke({
			color: 'transparent',
			width: 5
		}),
	});

	constructor(args: any) {
		super(FootprintPolylineVisualizerType, args);
		this.fillColor = 'transparent';
		this.strokeColor = 'rgb(211, 147, 225)';
		this.containerLayerOpacity = 0.5;
	}

	getFeatureStyles(classes, featureStyle) {
		const isFavorites = classes.includes('favorites');
		const isActive = classes.includes('active');
		const baseHoverStyle = this.baseFeatureStyle(isActive, isFavorites, featureStyle);
		return isFavorites ? [this.baseFavoritesStyle(featureStyle), baseHoverStyle] : [baseHoverStyle];
	}

	private baseFavoritesStyle({stroke, fill}) {
		return this.getStyleWithStroke(stroke.width, stroke.colors['favorites'], fill);
	}

	private baseFeatureStyle(isActive, isFavorites, {stroke, fill}) {
		let [ colors, width ] = [stroke.colors, stroke.width ];
		width = isFavorites ? (width * 0.6) : width;
		const color = isActive ? colors['active'] : colors[''];
		return this.getStyleWithStroke(width, color, fill);
	}

	private getStyleWithStroke(width, color, fill?) {
		const stroke = new Stroke({width, color});
		const styleObj = fill ? {stroke, fill} : {stroke};
		return new Style(styleObj)
	}

	onInit(mapId: string, map: IMap) {
		super.onInit(mapId, map);
		this.initHoverPolygonLayer();
	}

	createLayer() {
		super.createLayer();
		this.resetInteractions();
	}

	resetInteractions(): void {
		this._imap.mapObject.removeInteraction(this.selectDoubleClick);
		this._imap.mapObject.removeInteraction(this.selectPointerMove);
		this.addPointerMoveInteraction();
		this.addDoubleClickInteraction();
	}

	initHoverPolygonLayer() {
		this.hoverLayerSource = new SourceVector();
		this.hoverLayer = new Vector({
			source: this.hoverLayerSource,
			style: (feature: Feature) => {
				const markClass = this.getMarkClass(feature.getId());
				return this.getFeatureStyles(markClass, this.styleProperties.hoverFeature);
			}
		});
		this.hoverLayer.setZIndex(100000)
		this._imap.mapObject.addLayer(this.hoverLayer);
	}

	getMarkClass(featureId): any {
		return this.markups
			.filter( ({id}) => id === featureId)
			.map(mark => mark.class)
	}

	addPointerMoveInteraction() {
		this.selectPointerMove = new Select({
			condition: condition.pointerMove,
			style: () => this.interactionsStyle,
			layers: [this._footprintsVector]
		});
		this.selectPointerMove.on('select', this.onSelectFeature.bind(this));
		this._imap.mapObject.addInteraction(this.selectPointerMove);
	}

	addDoubleClickInteraction() {
		this.selectDoubleClick = new Select({
			condition: condition.doubleClick,
			style: () => this.interactionsStyle,
			layers: [this._footprintsVector]
		});
		this.selectDoubleClick.on('select', this.onDoubleClickFeature.bind(this));
		this._imap.mapObject.addInteraction(this.selectDoubleClick);
	}

	onSelectFeature($event) {
		const event = { visualizerType: this.type };
		if ($event.selected.length > 0){
			const id = $event.selected[0].getId();
			const hoverFeature = this.hoverLayerSource.getFeatureById(id);
			if (!hoverFeature || hoverFeature.getId() !== id ) {
				this.onHoverFeature.emit({...event, id});
			}
		} else {
			this.onHoverFeature.emit({...event});
		}
	}

	onDoubleClickFeature($event) {
		if($event.selected.length > 0) {
			const visualizerType = this.type;
			const id = $event.selected[0].getId();
			this.doubleClickFeature.emit({visualizerType, id});
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

	setHoverFeature(id) {
		super.setHoverFeature(id);
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
		const markClasses = this.getMarkClass(feature.getId());
		return this.getFeatureStyles(markClasses, this.styleProperties.staticFeature);
	}

	onMarkupFeatures(markup: IMarkupEvent) {
		super.onMarkupFeatures(markup);
		this.hoverLayerSource.refresh();
		if (this._source) {
			this._source.refresh();
		}
	}


}
