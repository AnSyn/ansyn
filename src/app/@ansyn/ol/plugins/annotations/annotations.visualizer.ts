import { Inject } from '@angular/core';
import {
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
import olCollection from 'ol/Collection';
import OLGeoJSON from 'ol/format/GeoJSON';
import olCircle from 'ol/geom/Circle';
import olLineString from 'ol/geom/LineString';
import olMultiLineString from 'ol/geom/MultiLineString';
import olPoint from 'ol/geom/Point';
import olPolygon, { fromCircle } from 'ol/geom/Polygon';
import DragBox from 'ol/interaction/DragBox';
import olTranslate from 'ol/interaction/Translate';
import Draw from 'ol/interaction/Draw';
import * as Sphere from 'ol/sphere';
import olFill from 'ol/style/Fill';
import olIcon from 'ol/style/Icon';
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
import { DragPixelsInteraction } from './dragPixelsInteraction';

export interface ILabelEditMode {
	originalFeature: olFeature,
	labelFeature: olFeature
}


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
	geoJsonFormat: OLGeoJSON;
	dragBox = new DragBox({ condition: platformModifierKeyOnly });
	translationSubscriptions = [];
	edited: ILabelEditMode;
	events = {
		onClick: new Subject(),
		onSelect: new Subject<string[]>(),
		onHover: new Subject<string>(),
		onChangeMode: new Subject<{ mode: AnnotationMode, forceBroadcast: boolean }>(),
		onDrawEnd: new Subject<IDrawEndEvent>(),
		removeEntity: new Subject<string>(),
		updateEntity: new Subject<IVisualizerEntity>(),
		offsetEntity: new Subject<any>(),
		onEditStart: new Subject<ILabelEditMode>(),
		onEditEnd: new Subject()
	};
	clearModified: any = tap(() => {
		if (this.edited) {
			this.editFeature(this.edited.originalFeature.getId())
		}
	});
	@AutoSubscription
	selected$ = this.events.onSelect.pipe(this.clearModified, tap((selected: any) => this.selected = selected));

	@AutoSubscription
	edited$ = this.events.onEditStart.pipe(tap((edited) => this.edited = edited));

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

	private iconSrc = '';

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
					fontSize: (feature) => {
						const entity = this.idToEntity.get(feature.getId());
						const labelSize = entity && entity.originalEntity && entity.originalEntity.labelSize;
						return labelSize || 28;
					},
					stroke: '#000',
					fill: 'white',
					offsetY: (feature: olFeature) => {
						const { mode, style } = feature.getProperties();
						return mode === 'Point' && !style.initial.label.geometry ? 30 : 0;
					},
					text: (feature: olFeature) => {
						const entity = this.idToEntity.get(feature.getId());
						if (entity) {
							const { label } = entity.originalEntity;
							return label.text || '';
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
						fontSize: 12,
						fill: '#fff',
						'stroke-width': 3,
						text: (feature) => feature.getId() || ''
					}
				}
			});
		}
		this.geoJsonFormat = new OLGeoJSON();
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
		return annotationsLayer.features.map((feature: Feature<any>): IVisualizerEntity => {
			const featureJson = { ...feature };
			delete featureJson.properties.featureJson;
			return {
				featureJson,
				id: feature.properties.id,
				style: feature.properties.style,
				showMeasures: feature.properties.showMeasures,
				label: feature.properties.label,
				icon: feature.properties.icon,
				undeletable: feature.properties.undeletable,
				editMode: feature.properties.editMode
			};
		});
	}

	setMode(mode, forceBroadcast: boolean) {
		if (this.mode !== mode) {
			this.mode = mode;
			this.removeInteractions();

			if (this.mode === AnnotationMode.Translate) {
				const traslationInteractionHandler = new DragPixelsInteraction();
				this.translationSubscriptions.push(
					traslationInteractionHandler.onDrag.subscribe((pixel: [number, number]) => {
						if (Boolean(this.source)) {
							const features: [] = this.source.getFeatures();
							features.forEach((feature: any) => {
								const geometry = feature.getGeometry();
								geometry.translate(pixel[0], pixel[1]);
							});
							this.offset[0] = this.offset[0] + pixel[0];
							this.offset[1] = this.offset[1] + pixel[1];
						}
					}),
					traslationInteractionHandler.onStopDrag.subscribe(() => {
						this.events.offsetEntity.next(this.offset);
					})
				);
				this.addInteraction(VisualizerInteractions.translateInteractionHandler, traslationInteractionHandler);
			} else if (this.mode) {
				const drawInteractionHandler = new Draw({
					type: this.modeDictionary[mode] ? this.modeDictionary[mode].type : mode,
					geometryFunction: this.modeDictionary[mode] ? this.modeDictionary[mode].geometryFunction : undefined,
					condition: (event: any) => (<MouseEvent>event.originalEvent).which === 1,
					style: this.featureStyle.bind(this)
				});

				drawInteractionHandler.on('drawend', this.onDrawEndEvent.bind(this));
				this.addInteraction(VisualizerInteractions.drawInteractionHandler, drawInteractionHandler);
			}
			this.events.onChangeMode.next({ mode, forceBroadcast });
		}
	}

	getFeatureBoundingRect(selectedFeature): IAnnotationBoundingRect {
		const { geometry }: any = new OLGeoJSON().writeFeatureObject(selectedFeature);
		const { maxX, maxY, minX, minY } = this.findMinMax(geometry.coordinates);
		const width = `${ maxX - minX }px`;
		const left = `${ minX }px`;
		const height = `${ maxY - minY }px`;
		const top = `${ minY }px`;
		return { left, top, width, height };
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

	onInit() {
		super.onInit();
		const { mapObject: map } = this.iMap;
		map.on('click', this.mapClick);
		map.on('pointermove', this.mapPointermove);
		this.dragBox.on('boxstart', this.mapBoxstart);
		this.dragBox.on('boxdrag', this.mapBoxdrag);
		map.addInteraction(this.dragBox);
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
		this.setMode(undefined, true);
		const id = UUID.UUID();
		const geometry = feature.getGeometry();
		let cloneGeometry = <any>geometry.clone();
		if (cloneGeometry instanceof olCircle) {
			cloneGeometry = <any>fromCircle(<any>cloneGeometry);
		}
		if (this.offset[0] !== 0 || this.offset[1] !== 0) {
			cloneGeometry.translate(-this.offset[0], -this.offset[1]);
		}
		feature.setGeometry(cloneGeometry);
		feature.setProperties({
			id,
			style: cloneDeep(this.visualizerStyle),
			showMeasures: false,
			label: {text: '' , geometry: null},
			labelSize: 28,
			icon: this.iconSrc,
			undeletable: false,
			editMode: false,
			mode
		});
		feature.setId(id);
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

	removeInteractions() {
		this.removeInteraction(VisualizerInteractions.drawInteractionHandler);
		this.translationSubscriptions.forEach((subscriber) => subscriber.unsubscribe());
		this.translationSubscriptions = [];
		this.removeInteraction(VisualizerInteractions.translateInteractionHandler);
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
		this.removeInteractions();
		map.un('click', this.mapClick);
		map.un('pointermove', this.mapPointermove);
		map.removeInteraction(this.dragBox);

	}

	featureStyle(feature: olFeature, state: string = VisualizerStates.INITIAL) {
		let superStyle = super.featureStyle(feature, state);
		let styles: olStyle[] = Array.isArray(superStyle) ? superStyle : [superStyle];
		const entity = this.getEntity(feature);
		if (entity && entity.showMeasures) {
			styles.push(...this.getMeasuresAsStyles(feature));
		}
		if (entity && entity.icon) {
			styles.push(this.getCenterIndicationStyle(feature));
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
		const centerPoint = this.getCenterOfFeature(feature);
		return new olStyle({
			geometry: new olPoint(centerPoint.coordinates),
			image: new olIcon({
				scale: 1,
				src: feature.getProperties().icon
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
					text: `Circumference: ${ this.formatLength(calcCircumference) }`,
					offsetY: -height / 2 - 44
				})
			}),
			new olStyle({
				text: new olText({
					...this.measuresTextStyle,
					text: `Area: ${ this.formatArea(calcArea / 1000000) }`,
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
		this.events.onSelect.next(this.selected.filter((id) => id !== featureId));
	}

	updateFeature(featureId, props: Partial<IVisualizerEntity>) {
		const entity = this.idToEntity.get(featureId);
		if (entity) {
			entity.originalEntity = merge({}, entity.originalEntity, props);
			this.events.updateEntity.next(entity.originalEntity);
			this.source.refresh();
		}

	}

	setVisibility(isVisible: boolean) {
		super.setVisibility(isVisible);
		this.events.onSelect.next([]);
	}

	public setIconSrc(src: string) {
		this.iconSrc = src;
	}

	editFeature(featureId: any) {
		let oldFeature = null;
		let event = null;

		if (this.edited) {
			const { originalFeature } = this.edited;
			this.removeInteraction('translateInteractionHandler');
			oldFeature = originalFeature;
		}

		if (!oldFeature || featureId !== oldFeature.getId()) { // start editing
			const originalFeature: olFeature = this.source.getFeatureById(featureId);
			this.updateFeature(originalFeature.getId(), { editMode: true });
			const labelFeature = this.createLabelFeature(originalFeature);

			this.addInteraction('translateInteractionHandler', this.moveLabelInteraction(originalFeature, labelFeature));
			event = {
				originalFeature,
				labelFeature
			};
			this.source.addFeature(labelFeature);
		} else {
			this.updateFeature(featureId, { editMode: false });
			this.source.removeFeature(this.edited.labelFeature);
		}
		this.source.refresh();
		this.events.onEditStart.next(event);
	}

	private createLabelFeature(feature: olFeature): olFeature {
		const center = this.getCenterOfFeature(feature);
		const entity = this.getEntity(feature);
		const { mode: entityMode } = feature.getProperties();
		const { label } = feature.getProperties();
		const labelFeature = new olFeature({
			geometry: label.geometry ? label.geometry : new olPoint(center.coordinates),
		});
		labelFeature.setStyle(new olStyle({
			text: new olText({
				font: entity.style.initial.label.font,
				fill: new olFill({ color: entity.style.initial.label.fill }),
				text: label.text,
				offsetY: entityMode === 'Point' ? 30 : 0
			})
		}));

		return labelFeature;
	}

	private moveLabelInteraction(originalFeature: olFeature, labelFeature: olFeature): olTranslate {
		const translateInteraction = new olTranslate({
			features: new olCollection([labelFeature]),
			hitTolerance: 2
		});
		translateInteraction.on('translateend', (translateend) => {
			const newCoord = this.geoJsonFormat.writeGeometryObject(translateend.features.item(0).getGeometry());
			this.projectionService.projectAccurately(newCoord, this.iMap.mapObject).subscribe( (accuracyPoint) => {
				this.updateFeature(originalFeature.getId(), { label: { text: originalFeature.get('label').text, geometry: accuracyPoint}});
				this.purgeCache(originalFeature);
				this.featureStyle(originalFeature);
			})

		});

		return translateInteraction;
	}

	protected mapClick = (event) => {
		if (this.mapSearchIsActive || this.mode || this.isHidden) {
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
		this.events.onSelect.next([]);
	};

	protected mapBoxdrag = ({ target }) => {
		if (this.isHidden) {
			return;
		}
		const extent = target.getGeometry().getExtent();
		const selected = [];
		this.vector.getSource().forEachFeatureIntersectingExtent(extent, (feature) => {
			selected.push(feature.getId());
		});
		this.events.onSelect.next(selected);
	};

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
}
