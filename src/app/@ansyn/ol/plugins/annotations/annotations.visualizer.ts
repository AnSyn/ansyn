import { Inject } from '@angular/core';
import {
	getPointByGeometry,
	ImageryVisualizer,
	IVisualizerEntity,
	MarkerSize,
	VisualizerInteractions,
	VisualizerStates
} from '@ansyn/imagery';
import { UUID } from 'angular2-uuid';
import { AutoSubscription } from 'auto-subscriptions';
import { Feature, FeatureCollection, GeometryObject } from 'geojson';
import { cloneDeep, merge } from 'lodash';
import { platformModifierKeyOnly } from 'ol/events/condition';
import olFeature from 'ol/Feature';
import OLGeoJSON from 'ol/format/GeoJSON';
import olCircle from 'ol/geom/Circle';
import olLineString from 'ol/geom/LineString';
import olMultiLineString from 'ol/geom/MultiLineString';
import olPoint from 'ol/geom/Point';
import olPolygon, { fromCircle } from 'ol/geom/Polygon';
import DragBox from 'ol/interaction/DragBox';
import Draw from 'ol/interaction/Draw';
import * as Sphere from 'ol/sphere';
import olFill from 'ol/style/Fill';
import olIcon from 'ol/style/Icon'
import olStroke from 'ol/style/Stroke';
import olStyle from 'ol/style/Style';
import olText from 'ol/style/Text';
import { Subject } from 'rxjs';
import { mergeMap, take, tap } from 'rxjs/operators';
import { OpenLayersMap } from '../../maps/open-layers-map/openlayers-map/openlayers-map';
import { OpenLayersProjectionService } from '../../projection/open-layers-projection.service';
import { EntitiesVisualizer } from '../entities-visualizer';
import { IOLPluginsConfig, OL_PLUGINS_CONFIG } from '../plugins.config';
import { AnnotationMode, IAnnotationBoundingRect, IDrawEndEvent } from './annotations.model';

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
	selected: string[] = [];
	private iconSrc = '';
	geoJsonFormat: OLGeoJSON;
	dragBox = new DragBox({ condition: platformModifierKeyOnly });

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
		onSelect: new Subject<string[]>(),
		onHover: new Subject<string>(),
		onChangeMode: new Subject<AnnotationMode>(),
		onDrawEnd: new Subject<IDrawEndEvent>(),
		removeEntity: new Subject<string>(),
		updateEntity: new Subject<IVisualizerEntity>()
	};

	@AutoSubscription
	selected$ = this.events.onSelect.pipe(tap((selected) => this.selected = selected));

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
			label: feature.properties.label,
			icon: feature.properties.icon
		}));
	}

	constructor(protected projectionService: OpenLayersProjectionService,
				@Inject(OL_PLUGINS_CONFIG) protected olPluginsConfig: IOLPluginsConfig) {

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
		this.geoJsonFormat = new OLGeoJSON();
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

	getFeatureBoundingRect(selectedFeature): IAnnotationBoundingRect {
		const { geometry }: any = new OLGeoJSON().writeFeatureObject(selectedFeature);
		const { maxX, maxY, minX, minY } = this.findMinMax(geometry.coordinates);
		const width = `${maxX - minX}px`;
		const left = `${minX}px`;
		const height = `${maxY - minY}px`;
		const top = `${minY}px`;
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

	protected mapClick = (event) => {
		if (this.mapSearchIsActive || this.mode) {
			return;
		}
		const { shiftKey: multi } = event.originalEvent;
		const selectedFeature = this.featureAtPixel(event.pixel);
		let ids = [];
		if (selectedFeature) {
			const featureId = selectedFeature.getId();
			ids = multi ? this.selected.includes(featureId) ? this.selected.filter(id => id !== featureId) : [...this.selected, featureId] : [featureId];
		} else {
			ids = multi ? this.selected : [];
		}
		this.events.onSelect.next(ids);
	};

	protected mapPointermove = (event) => {
		if (this.mapSearchIsActive || this.mode) {
			return;
		}
		const selectedFeature = this.featureAtPixel(event.pixel);
		this.events.onHover.next(selectedFeature ? selectedFeature.getId() : null);
	};

	protected mapBoxstart = () => {
		this.events.onSelect.next([])
	};

	protected mapBoxdrag = ({ target }) => {
		const extent = target.getGeometry().getExtent();
		const selected = [];
		this.vector.getSource().forEachFeatureIntersectingExtent(extent, (feature) => {
			selected.push(feature.getId());
		});
		this.events.onSelect.next(selected)
	};

	onInit() {
		super.onInit();
		const { mapObject: map } = this.iMap;
		map.on('click', this.mapClick);
		map.on('pointermove', this.mapPointermove);
		this.dragBox.on('boxstart', this.mapBoxstart);
		this.dragBox.on('boxdrag', this.mapBoxdrag);
		map.addInteraction(this.dragBox)
	}

	featureAtPixel = (pixel) => {
		const featuresArray = [];
		this.iMap.mapObject.forEachFeatureAtPixel(pixel, feature => {
			featuresArray.push(feature);
		}, { hitTolerance: 2, layerFilter: (layer) => this.vector === layer });
		return this.findFeatureWithMinimumArea(featuresArray);
	};

	onDrawEndEvent({ feature }) {
		const { mode } = this;
		this.setMode(undefined);
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
			icon: this.iconSrc,
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
		const { mapObject: map } = this.iMap;
		this.removeDrawInteraction();
		map.un('click', this.mapClick);
		map.un('pointermove', this.mapPointermove);
		map.removeInteraction(this.dragBox)

	}

	featureStyle(feature: olFeature, state: string = VisualizerStates.INITIAL) {
		let styles: olStyle[] = [super.featureStyle(feature, state)];
		const entity = this.getEntity(feature);
		if (entity && entity.showMeasures) {
			styles.push(...this.getMeasuresAsStyles(feature));
		}
		if (entity && entity.icon ) {
			styles.push(this.getCenterIndicationStyle(feature))
		}

		return styles;
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

	getCenterIndicationStyle(feature: olFeature): olStyle {
		const featureGeoJson = <any>this.geoJsonFormat.writeFeatureObject(feature);
		const centerPoint = getPointByGeometry(featureGeoJson.geometry);
		return new olStyle({
			geometry: new olPoint(centerPoint.coordinates),
			image: new olIcon({
				scale: 1,
				src: featureGeoJson.properties.icon
			})

		});
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

	removeFeature(featureId: string, internal = false) {
		super.removeEntity(featureId, internal);
		if (!internal) {
			this.events.removeEntity.next(featureId);
		}
		this.events.onSelect.next(this.selected.filter((id) => id !== featureId))
	}

	updateFeature(featureId, props: Partial<IVisualizerEntity>) {
		const entity = this.idToEntity.get(featureId);

		if (entity) {
			entity.originalEntity = merge({}, entity.originalEntity, props);
			this.events.updateEntity.next(entity.originalEntity);
			this.source.refresh();
		}

	}

	public setIconSrc(src: string) {
		this.iconSrc = src;
	}
}


