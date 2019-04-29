import Draw from 'ol/interaction/Draw';
import Select from 'ol/interaction/Select';
import * as Sphere from 'ol/sphere';
import olCircle from 'ol/geom/Circle';
import olLineString from 'ol/geom/LineString';
import olMultiLineString from 'ol/geom/MultiLineString';
import olPolygon, { fromCircle } from 'ol/geom/Polygon';
import olFeature from 'ol/Feature';
import olStyle from 'ol/style/Style';
import olFill from 'ol/style/Fill';
import olText from 'ol/style/Text';
import olStroke from 'ol/style/Stroke';

import * as condition from 'ol/events/condition';

import {
	ImageryVisualizer,
	IVisualizerEntity, IVisualizerStateStyle,
	MarkerSize,
	VisualizerInteractions,
	VisualizerStates
} from '@ansyn/imagery';

import { cloneDeep, merge } from 'lodash';
import { Feature, FeatureCollection, GeometryObject } from 'geojson';
import { Subject } from 'rxjs';
import { Inject } from '@angular/core';
import { mergeMap, take, tap } from 'rxjs/operators';
import OLGeoJSON from 'ol/format/GeoJSON';
import { UUID } from 'angular2-uuid';
import { EntitiesVisualizer } from '../entities-visualizer';
import { OpenLayersMap } from '../../maps/open-layers-map/openlayers-map/openlayers-map';
import { OpenLayersProjectionService } from '../../projection/open-layers-projection.service';
import { IOLPluginsConfig, OL_PLUGINS_CONFIG } from '../plugins.config';
import {
	AnnotationInteraction,
	AnnotationMode,
	IAnnotationBoundingRect,
	IAnnotationsSelectionEventData,
	IDrawEndEvent
} from './annotations.model';


// @dynamic
@ImageryVisualizer({
	supported: [OpenLayersMap],
	deps: [OpenLayersProjectionService, OL_PLUGINS_CONFIG],
	isHideable: true
})
export class AnnotationsVisualizer extends EntitiesVisualizer {
	static fillAlpha = 0.4;
	disableCache = true;
	public mode: AnnotationMode;
	mapSearchIsActive = false;

	protected measuresTextStyle = {
		font: '16px Calibri,sans-serif',
		fill: new olFill({
			color: '#fff'
		}),
		stroke: new olStroke({
			color: '#000',
			width: 3
		}),
		offsetY: 30
	};

	events = {
		onClick: new Subject(),
		onSelect: new Subject<IAnnotationsSelectionEventData>(),
		onChangeMode: new Subject<AnnotationMode>(),
		onDrawEnd: new Subject<IDrawEndEvent>(),
		removeEntity: new Subject<string>(),
		updateEntity: new Subject<IVisualizerEntity>()
	};

	modeDictionary = {
		Arrow: {
			type: 'LineString',
			geometryFunction: this.arrowGeometryFunction.bind(this)
		},
		Rectangle: {
			type: 'Circle',
			geometryFunction: this.rectangleGeometryFunction.bind(this)
		}
	};

	get mapRotation(): number {
		return this.iMap.mapObject.getView().getRotation();
	}

	get interactionParams() {
		return {
			layers: [this.vector],
			hitTolerance: 0,
			style: (feature) => this.featureStyle(feature),
			multi: true
		};
	}

	findFeatureWithMinimumArea(featuresArray: any[]) {
		return featuresArray.reduce((prevResult, currFeature) => {
			const currGeometry = currFeature.getGeometry();
			const currArea = currGeometry.getArea ? currGeometry.getArea() : 0;
			if (currArea < prevResult.area) {
				return { feature: currFeature, area: currArea };
			} else {
				return prevResult;
			}
		}, { feature: null, area: Infinity }).feature;
	}

	annotationsLayerToEntities(annotationsLayer: FeatureCollection<any>): IVisualizerEntity[] {
		return annotationsLayer.features.map((feature: Feature<any>): IVisualizerEntity => ({
			featureJson: feature,
			id: feature.properties.id,
			style: feature.properties.style,
			showMeasures: feature.properties.showMeasures,
			label: feature.properties.label
		}));
	}

	constructor(protected projectionService: OpenLayersProjectionService,
				@Inject(OL_PLUGINS_CONFIG) olPluginsConfig: IOLPluginsConfig) {

		super(null, {
			initial: {
				stroke: '#27b2cfe6',
				'stroke-width': 1,
				fill: `white`,
				'fill-opacity': AnnotationsVisualizer.fillAlpha,
				'stroke-opacity': 1,
				'marker-size': MarkerSize.medium,
				'marker-color': `#ffffff`,
				label: {
					overflow: true,
					font: '27px Calibri,sans-serif',
					stroke: '#000',
					fill: 'white',
					offsetY: (feature: olFeature) => {
						const { mode } = feature.getProperties();
						return mode === 'Point' ? 30 : 0;
					},
					text: (feature: olFeature) => {
						const entity = this.idToEntity.get(feature.getId());
						if (entity) {
							const { label } = entity.originalEntity;
							return label || '';
						}
						return '';
					}
				}
			}
		});

		//  0 or 1
		if (Number(olPluginsConfig.Annotations.displayId)) {
			this.updateStyle({
				initial: {
					label: {
						font: '12px Calibri,sans-serif',
						fill: '#fff',
						'stroke-width': 3,
						text: (feature) => feature.getId() || ''
					}
				}
			});
		}
	}

	setMode(mode) {
		if (this.mode !== mode) {
			this.mode = mode;
			this.removeDrawInteraction();

			if (this.mode) {
				const drawInteractionHandler = new Draw({
					type: this.modeDictionary[mode] ? this.modeDictionary[mode].type : mode,
					geometryFunction: this.modeDictionary[mode] ? this.modeDictionary[mode].geometryFunction : undefined,
					condition: (event: any) => (<MouseEvent>event.originalEvent).which === 1,
					style: this.featureStyle.bind(this)
				});

				drawInteractionHandler.on('drawend', this.onDrawEndEvent.bind(this));
				this.addInteraction(VisualizerInteractions.drawInteractionHandler, drawInteractionHandler);
			}
			this.events.onChangeMode.next(mode);
		}
	}

	resetInteractions(): void {
		this.setMode(null);
		this.removeInteraction(VisualizerInteractions.click);
		this.addInteraction(VisualizerInteractions.click, this.createClickInteraction());
		this.removeInteraction(VisualizerInteractions.pointerMove);
		this.addInteraction(VisualizerInteractions.pointerMove, this.createHoverInteraction());
	}

	createClickInteraction() {
		const interaction = new Select(<any>{
			condition: condition.click,
			...this.interactionParams
		});
		interaction.on('select', this.onClickAnnotation.bind(this));
		return interaction;
	}

	onClickAnnotation(event) {
		this.clearCurrentHoverSelection();
		event.target.getFeatures().clear();
		if (this.mapSearchIsActive || this.mode) {
			return;
		}
		const selectedFeature = this.findFeatureWithMinimumArea(event.selected);
		const boundingRect = this.getFeatureBoundingRect(selectedFeature);
		const { id, showMeasures, label, style } = this.getEntity(selectedFeature);
		const eventData: IAnnotationsSelectionEventData = {
			label: label,
			mapId: this.mapId,
			style: style,
			featureId: id,
			boundingRect,
			type: selectedFeature ? selectedFeature.values_.mode : undefined,
			interactionType: AnnotationInteraction.click,
			showMeasures
		};

		this.events.onSelect.next(eventData);
	}

	clearCurrentHoverSelection() {
		const hoverInteraction = this.getInteraction(VisualizerInteractions.pointerMove);
		hoverInteraction.getFeatures().clear();
		this.onHoverInteraction(hoverInteraction);
	}

	createHoverInteraction() {
		const annotationHoverInteraction = new Select(<any>{
			condition: condition.pointerMove,
			...this.interactionParams
		});
		annotationHoverInteraction.on('select', this.onHoverAnnotation.bind(this));
		return annotationHoverInteraction;
	}

	onHoverAnnotation(event) {
		if (this.mapSearchIsActive || this.mode) {
			return;
		}
		return this.onHoverInteraction(event.target);
	}

	onHoverInteraction(interaction) {
		if (this.mapSearchIsActive || this.mode) {
			return;
		}
		let selectedFeature, boundingRect, id, label, style;
		let selected = interaction.getFeatures().getArray();
		if (selected.length > 0) {
			selectedFeature = this.findFeatureWithMinimumArea(selected);
			boundingRect = this.getFeatureBoundingRect(selectedFeature);
			id = this.getEntity(selectedFeature).id;
			label = this.getEntity(selectedFeature).label;
			style = this.getEntity(selectedFeature).style;
		}
		const eventData: IAnnotationsSelectionEventData = {
			label: label,
			mapId: this.mapId,
			featureId: id,
			style: style,
			boundingRect,
			type: selectedFeature ? selectedFeature.values_.mode : undefined,
			interactionType: AnnotationInteraction.hover
		};
		this.events.onSelect.next(eventData);
	}

	getFeatureBoundingRect(selectedFeature): IAnnotationBoundingRect {
		const { geometry }: any = new OLGeoJSON().writeFeatureObject(selectedFeature);
		const { maxX, maxY, minX, minY } = this.findMinMax(geometry.coordinates);
		const width = maxX - minX;
		const left = minX;
		const height = maxY - minY;
		const top = maxY - height;
		return { left, top, width, height };
	}

	private isNumArray([first, second]) {
		return typeof first === 'number' && typeof second === 'number';
	}

	private findMinMaxHelper(array, prev = { maxX: -Infinity, maxY: -Infinity, minX: Infinity, minY: Infinity }) {
		const [x, y] = this.iMap.mapObject.getPixelFromCoordinate(array);
		return {
			maxX: Math.max(x, prev.maxX),
			maxY: Math.max(y, prev.maxY),
			minX: Math.min(x, prev.minX),
			minY: Math.min(y, prev.minY)
		};
	}

	findMinMax(array) {
		if (this.isNumArray(array)) {
			return this.findMinMaxHelper(array);
		}
		return array.reduce((prev = { maxX: -Infinity, maxY: -Infinity, minX: Infinity, minY: Infinity }, item) => {
			if (this.isNumArray(item)) {
				return this.findMinMaxHelper(item, prev);
			}
			const { maxX, maxY, minX, minY } = this.findMinMax(item);
			return {
				maxX: Math.max(maxX, prev.maxX),
				maxY: Math.max(maxY, prev.maxY),
				minX: Math.min(minX, prev.minX),
				minY: Math.min(minY, prev.minY)
			};

		}, undefined);
	}

	onDrawEndEvent({ feature }) {
		const { mode } = this;
		this.setMode(null);
		const geometry = feature.getGeometry();
		let cloneGeometry = <any>geometry.clone();
		if (cloneGeometry instanceof olCircle) {
			cloneGeometry = <any>fromCircle(<any>cloneGeometry);
		}
		feature.setGeometry(cloneGeometry);
		feature.setProperties({
			id: UUID.UUID(),
			style: cloneDeep(this.visualizerStyle),
			showMeasures: false,
			label: '',
			mode
		});

		this.projectionService
			.projectCollectionAccurately([feature], this.iMap.mapObject)
			.pipe(
				take(1),
				mergeMap((GeoJSON: FeatureCollection<GeometryObject>) => {
					return this.addOrUpdateEntities(this.annotationsLayerToEntities(GeoJSON)).pipe(
						tap(() => this.events.onDrawEnd.next({ GeoJSON, feature }))
					);
				})
			).subscribe();

	}

	removeDrawInteraction() {
		this.removeInteraction(VisualizerInteractions.drawInteractionHandler);
	}

	rectangleGeometryFunction([topLeft, bottomRight], opt_geometry) {
		const [x1, y1] = this.iMap.mapObject.getPixelFromCoordinate(topLeft);
		const [x2, y2] = this.iMap.mapObject.getPixelFromCoordinate(bottomRight);
		const topRight = this.iMap.mapObject.getCoordinateFromPixel([x2, y1]);
		const bottomLeft = this.iMap.mapObject.getCoordinateFromPixel([x1, y2]);
		const geometry = opt_geometry || new olPolygon([]);
		const boundingBox = [topLeft, topRight, bottomRight, bottomLeft, topLeft];
		geometry.setCoordinates([boundingBox]);
		return geometry;
	}

	arrowGeometryFunction(coordinates, opt_geometry) {
		let geometry = opt_geometry;
		if (opt_geometry) {
			// two lines to draw arrow
			const start = coordinates[coordinates.length - 2];
			const end = coordinates[coordinates.length - 1];
			const dx = end[0] - start[0];
			const dy = end[1] - start[1];
			const rotation = Math.atan2(dy, dx);
			const lineLength = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
			const factor = lineLength * 0.1;
			const lineStr1 = new olLineString([end, [end[0] - factor, end[1] + factor]]);
			const lineStr2 = new olLineString([end, [end[0] - factor, end[1] - factor]]);
			lineStr1.rotate(rotation, end);
			lineStr2.rotate(rotation, end);
			geometry.setCoordinates([coordinates, lineStr1.getCoordinates(), lineStr2.getCoordinates()]);
		} else {
			geometry = new olMultiLineString([coordinates]);
		}
		return geometry;
	}

	onDispose(): void {
		super.onDispose();
		this.removeDrawInteraction();
	}

	featureStyle(feature: olFeature, state: string = VisualizerStates.INITIAL) {
		const style: olStyle = super.featureStyle(feature, state);
		const entity = this.getEntity(feature);
		if (entity && entity.showMeasures) {
			return [style, ...this.getMeasuresAsStyles(feature)];
		} else {
			return style;
		}
	}

	getMeasuresAsStyles(feature: olFeature): olStyle[] {
		const { mode } = feature.getProperties();
		const view = (<any>this.iMap.mapObject).getView();
		const projection = view.getProjection();
		const moreStyles: olStyle[] = [];
		let coordinates: any[] = [];
		switch (mode) {
			case 'LineString': {
				coordinates = (<olLineString>feature.getGeometry()).getCoordinates();
				for (let i = 0; i < coordinates.length - 1; i++) {
					const line: olLineString = new olLineString([coordinates[i], coordinates[i + 1]]);
					moreStyles.push(new olStyle({
						geometry: line,
						text: new olText({
							...this.measuresTextStyle,
							text: this.formatLength(Sphere.getLength(line, { projection }))
						})
					}));
				}
			}
				break;
			case 'Polygon':
			case 'Arrow':
				coordinates = (<olLineString>feature.getGeometry()).getCoordinates()[0];
				for (let i = 0; i < coordinates.length - 1; i++) {
					const line: olLineString = new olLineString([coordinates[i], coordinates[i + 1]]);
					moreStyles.push(new olStyle({
						geometry: line,
						text: new olText({
							...this.measuresTextStyle,
							text: this.formatLength(Sphere.getLength(line, { projection }))
						})
					}));
				}
				break;
			case 'Rectangle': {
				coordinates = (<olLineString>feature.getGeometry()).getCoordinates()[0];
				for (let i = 0; i < 2; i++) {
					const line: olLineString = new olLineString([coordinates[i], coordinates[i + 1]]);
					moreStyles.push(new olStyle({
						geometry: line,
						text: new olText({
							...this.measuresTextStyle,
							text: this.formatLength(Sphere.getLength(line, { projection }))
						})
					}));
				}
			}
				break;
			case 'Circle':
				coordinates = (<olLineString>feature.getGeometry()).getCoordinates()[0];
				const leftright = coordinates.reduce((prevResult, currCoord) => {
					if (currCoord[0] > prevResult.right[0]) {
						return { left: prevResult.left, right: currCoord };
					} else if (currCoord[0] < prevResult.left[0]) {
						return { left: currCoord, right: prevResult.right };
					} else {
						return prevResult;
					}
				}, { left: [Infinity, 0], right: [-Infinity, 0] });
				const line: olLineString = new olLineString([leftright.left, leftright.right]);
				moreStyles.push(
					new olStyle({
						geometry: line,
						stroke: new olStroke({
							color: '#27b2cfe6',
							width: 1
						}),
						text: new olText({
							...this.measuresTextStyle,
							text: this.formatLength(Sphere.getLength(line, { projection }))
						})
					}));
				break;
		}
		moreStyles.push(...this.areaCircumferenceStyles(feature, projection));
		return moreStyles;
	}

	formatArea(calcArea: number): string {
		return Math.round(calcArea * 100) / 100 + ' Km²';
	};

	formatLength(calcLength): string {
		let output;
		if (calcLength >= 1000) {
			output = (Math.round(calcLength / 1000 * 100) / 100) + ' Km';
		} else {
			output = (Math.round(calcLength * 100) / 100) + ' m';
		}
		return output;
	};

	areaCircumferenceStyles(feature: any, projection: any): olStyle[] {

		const calcCircumference = Sphere.getLength(feature.getGeometry(), { projection });
		const calcArea = Sphere.getArea(feature.getGeometry(), { projection });
		const { height } = this.getFeatureBoundingRect(feature);
		if (!calcArea || !calcCircumference) {
			return [];
		}
		return [
			new olStyle({
				text: new olText({
					...this.measuresTextStyle,
					text: `Circumference: ${this.formatLength(calcCircumference)}`,
					offsetY: -height / 2 - 44
				})
			}),
			new olStyle({
				text: new olText({
					...this.measuresTextStyle,
					text: `Area: ${this.formatArea(calcArea / 1000000)}`,
					offsetY: -height / 2 - 25
				})
			})
		];
	}

	removeFeature(logicalEntityId: string, internal = false) {
		super.removeEntity(logicalEntityId, internal);
		if (!internal) {
			this.events.removeEntity.next(logicalEntityId);
		}
	}

	updateFeature(featureId, props: Partial<IVisualizerEntity>) {
		const entity = this.idToEntity.get(featureId);

		if (entity) {
			entity.originalEntity = merge({}, entity.originalEntity, props);
			this.events.updateEntity.next(entity.originalEntity);
			this.source.refresh();
		}

	}

}


