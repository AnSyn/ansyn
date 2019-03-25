import { EntitiesVisualizer } from '../entities-visualizer';
import Feature from 'ol/Feature';
import Draw from 'ol/interaction/Draw';
import Text from 'ol/style/Text';
import Fill from 'ol/style/Fill';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Circle from 'ol/style/Circle';
import Point from 'ol/geom/Point';
import MultiPoint from 'ol/geom/MultiPoint';
import LineString from 'ol/geom/LineString';
import VectorSource from 'ol/source/Vector';
import * as Sphere from 'ol/sphere';
import GeoJSON from 'ol/format/GeoJSON';
import { UUID } from 'angular2-uuid';
import { ImageryVisualizer, VisualizerInteractions } from '@ansyn/imagery';
import { FeatureCollection, GeometryObject } from 'geojson';
import { combineLatest, Observable } from 'rxjs';
import { selectActiveMapId } from '@ansyn/map-facade';
import { IToolsState, toolsFlags, toolsStateSelector } from '../../../../../menu-items/public_api';
import { Store } from '@ngrx/store';
import { getPointByGeometry, IVisualizerEntity, MarkerSize, VisualizerStates } from '@ansyn/core';
import { AutoSubscription } from 'auto-subscriptions';
import { OpenLayersMap } from '../../../maps/open-layers-map/openlayers-map/openlayers-map';
import { distinctUntilChanged, map, pluck, tap } from 'rxjs/operators';
import { OpenLayersProjectionService } from '../../../projection/open-layers-projection.service';

@ImageryVisualizer({
	supported: [OpenLayersMap],
	deps: [Store, OpenLayersProjectionService]
})
export class MeasureDistanceVisualizer extends EntitiesVisualizer {

	isActiveMap$: Observable<boolean> = this.store$.select(selectActiveMapId).pipe(
		map((activeMapId) => activeMapId === this.mapId),
		distinctUntilChanged()
	);

	isMeasureToolActive$: Observable<boolean> = this.store$.select(toolsStateSelector).pipe(
		pluck<IToolsState, Map<toolsFlags, boolean>>('flags'),
		map((flags) => flags.get(toolsFlags.isMeasureToolActive)),
		distinctUntilChanged()
	);

	@AutoSubscription
	onChanges$ = combineLatest(this.isActiveMap$, this.isMeasureToolActive$).pipe(
		tap(([isActiveMap, isMeasureToolActive]) => {
			if (isActiveMap && isMeasureToolActive) {
				this.createInteraction();
			} else {
				this.clearInteractionAndEntities();
			}
		}));

	protected allLengthTextStyle = new Text({
		font: '16px Calibri,sans-serif',
		fill: new Fill({
			color: '#fff'
		}),
		stroke: new Stroke({
			color: '#000',
			width: 3
		}),
		offsetY: 30
	});

	protected editDistanceStyle = new Style({
		fill: new Fill({
			color: 'rgba(255, 255, 255, 0.2)'
		}),
		stroke: new Stroke({
			color: 'yellow',
			lineDash: [10, 10],
			width: 2
		}),
		image: new Circle({
			radius: 5,
			stroke: new Stroke({
				color: 'rgba(0, 0, 0, 0.7)'
			}),
			fill: new Fill({
				color: 'rgba(255, 255, 255, 0.2)'
			})
		}),
		zIndex: 3
	});

	geoJsonFormat: GeoJSON;
	interactionSource: VectorSource;

	get drawInteractionHandler() {
		return this.interactions.get(VisualizerInteractions.drawInteractionHandler);
	}

	getSinglePointLengthTextStyle(): Text {
		return new Text({
			font: '14px Calibri,sans-serif',
			fill: new Fill({
				color: '#FFFFFF'
			}),
			stroke: new Stroke({
				color: '#3399CC',
				width: 3
			}),
			offsetY: 30
		});
	}

	constructor(protected store$: Store<any>, protected projectionService: OpenLayersProjectionService) {
		super(null, {
			initial: {
				stroke: '#3399CC',
				'stroke-width': 2,
				fill: '#FFFFFF',
				'marker-size': MarkerSize.small,
				'marker-color': '#FFFFFF',
				zIndex: 5
			}
		});

		this.geoJsonFormat = new GeoJSON();
	}

	onResetView(): Observable<boolean> {
		return super.onResetView()
			.pipe(tap(() => {
				if (this.drawInteractionHandler) {
					this.createInteraction();
				}
			}));
	}

	clearInteractionAndEntities() {
		this.removeDrawInteraction();
		this.clearEntities();
	}

	createInteraction(type = 'LineString') {
		this.removeDrawInteraction();

		this.interactionSource = new VectorSource({ wrapX: false });

		const drawInteractionHandler = new Draw(<any>{
			source: this.interactionSource,
			type: type,
			condition: (event) => event.originalEvent.which === 1,
			style: this.drawFeatureStyle.bind(this)
		});

		drawInteractionHandler.on('drawend', this.onDrawEndEvent.bind(this));
		this.addInteraction(VisualizerInteractions.drawInteractionHandler, drawInteractionHandler);
	}

	removeDrawInteraction() {
		this.removeInteraction(VisualizerInteractions.drawInteractionHandler);
	}

	onDrawEndEvent(data) {
		this.projectionService.projectCollectionAccurately([data.feature], this.iMap.mapObject)
			.subscribe((featureCollection: FeatureCollection<GeometryObject>) => {
				const [featureJson] = featureCollection.features;
				const newEntity: IVisualizerEntity = {
					id: UUID.UUID(),
					featureJson
				};
				this.addOrUpdateEntities([newEntity]).subscribe();
			});
	}

	// override base entities visualizer style
	featureStyle(feature: Feature, state: string = VisualizerStates.INITIAL) {
		const styles = this.mainStyle(feature);
		const measureStyles = this.getMeasureTextStyle(feature, true);
		measureStyles.forEach((style) => {
			styles.push(style);
		});
		return styles;
	}

	// draw style (temp until DBClick)
	drawFeatureStyle(feature: Feature) {
		const styles = [this.editDistanceStyle];
		const measureStyles = this.getMeasureTextStyle(feature);
		measureStyles.forEach((style) => {
			styles.push(style);
		});
		return styles;
	}

	// Line style (after DBClick)
	mainStyle(feature) {
		const styles = [new Style({
			stroke: new Stroke({
				color: this.visualizerStyle.initial.stroke,
				width: this.visualizerStyle.initial['stroke-width']
			})
		})];
		// Points
		const pointsStyle = new Style({
			image: new Circle({
				radius: 5,
				stroke: new Stroke({
					color: this.visualizerStyle.initial.stroke,
					width: this.visualizerStyle.initial['stroke-width']
				}),
				fill: new Fill({ color: this.visualizerStyle.initial.fill })
			}),
			geometry: function (feature) {
				// return the coordinates of the first ring of the polygon
				const coordinates = (<LineString>feature.getGeometry()).getCoordinates();
				return new MultiPoint(coordinates);
			}
		});
		styles.push(pointsStyle);
		return styles;
	}

	// points string styles
	getMeasureTextStyle(feature: Feature, calculateCenterOfMass = false) {
		const styles = [];
		const geometry = <LineString> feature.getGeometry();

		if (geometry.getType() === 'Point') {
			return styles;
		}
		const view = (<any>this.iMap.mapObject).getView();
		const projection = view.getProjection();

		// all line string
		const allLengthText = this.formatLength(geometry, projection);
		this.allLengthTextStyle.setText(allLengthText);
		let allLinePoint = new Point(geometry.getCoordinates()[0]);

		if (calculateCenterOfMass) {
			const featureId = <string> feature.getId();
			const entityMap = this.idToEntity.get(featureId);
			if (entityMap) {
				const featureGeoJson = <any> this.geoJsonFormat.writeFeatureObject(entityMap.feature);
				const centroid = getPointByGeometry(featureGeoJson.geometry);
				allLinePoint = new Point(<[number, number]> centroid.coordinates);
			}
		}

		// text points
		const length = geometry.getCoordinates().length;
		if (length > 2) {
			geometry.forEachSegment((start, end) => {
				const lineString = new LineString([start, end]);
				const segmentLengthText = this.formatLength(lineString, projection);
				const singlePointLengthTextStyle = this.getSinglePointLengthTextStyle();
				singlePointLengthTextStyle.setText(segmentLengthText);
				styles.push(new Style({
					geometry: new Point(end),
					text: singlePointLengthTextStyle
				}));
			});
		}

		styles.push(new Style({
			geometry: allLinePoint,
			text: this.allLengthTextStyle
		}));
		return styles;
	}

	/**
	 * Format length output.
	 * @param line The line.
	 * @param projection The Projection.
	 */
	formatLength(line, projection): string {
		const length = Sphere.getLength(line, { projection: projection });
		let output;
		if (length >= 1000) {
			output = (Math.round(length / 1000 * 100) / 100) +
				' ' + 'km';
		} else {
			output = (Math.round(length * 100) / 100) +
				' ' + 'm';
		}
		return output;
	};
}
