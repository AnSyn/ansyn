import { EntitiesVisualizer } from './entities-visualizer';
import Style from 'ol/style/style';
import proj from 'ol/proj';
import GeomPolygon from "ol/geom/polygon";
import Draw from "ol/interaction/draw";
import { StatusBarActionsTypes, statusBarFlagsItems, UpdateStatusFlagsAction } from "@ansyn/status-bar";
import { Observable } from "rxjs/Observable";
import { VisualizerInteractions } from "@ansyn/imagery/model/base-imagery-visualizer";
import { CommunicatorEntity } from "@ansyn/imagery";
import { Actions } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { cloneDeep, remove } from "lodash";
import { FeatureCollection, GeometryObject } from "geojson";
import { SetAnnotationsLayer } from "@ansyn/menu-items/layers-manager/actions/layers.actions";
import { ILayerState, layersStateSelector } from "@ansyn/menu-items/layers-manager/reducers/layers.reducer";
import { OverlaysCriteria, SetOverlaysCriteriaAction } from "@ansyn/core";
import { StatusBarFlag } from "@ansyn/status-bar/models";
import { statusBarStateSelector } from "@ansyn/status-bar/reducers/status-bar.reducer";

export class PolygonSearchVisualizer extends EntitiesVisualizer {
	static fillAlpha = 0.4;
	static lastPolygonSearchId: any = '';
	public annotationsLayer;
	flags: Map<StatusBarFlag, boolean> = new Map<StatusBarFlag, boolean>();

	get drawInteractionHandler() {
		return this.interactions.get(VisualizerInteractions.drawInteractionHandler);
	}

	flags$ = this.store$.select(statusBarStateSelector).pluck('flags').distinctUntilChanged();

	polygonSearch$: Observable<any> = this.actions$
		.ofType<UpdateStatusFlagsAction>(StatusBarActionsTypes.UPDATE_STATUS_FLAGS)
		.filter(action => action.payload.key === statusBarFlagsItems.polygonSearch)
		.do(() => {
			const isPolygonSearch = this.flags.get('POLYGON_SEARCH');
			const drawInteractionHandler = new Draw({
				type: 'Polygon',
				geometryFunction: undefined,
				condition: (event: ol.MapBrowserEvent) => (<MouseEvent>event.originalEvent).which === 1,
				style: this.featureStyle.bind(this)
			});
			if (isPolygonSearch === true ) {
				drawInteractionHandler.on('drawend', this.onDrawEndEvent.bind(this));
				this.addInteraction(VisualizerInteractions.drawInteractionHandler, drawInteractionHandler);
			}
			else {
				this.removeDrawInteraction();
			}
		});

	pinPointSearch$: Observable<any> = this.actions$
		.ofType<UpdateStatusFlagsAction>(StatusBarActionsTypes.UPDATE_STATUS_FLAGS)
		.filter(action => action.payload.key === statusBarFlagsItems.pinPointSearch && Boolean(this.flags.get('PIN_POINT_SEARCH')))
		.withLatestFrom(this.store$.select(layersStateSelector).pluck<ILayerState, FeatureCollection<any>>('annotationsLayer'), (action: any, annotationsLayer: any): any =>
		{
			return annotationsLayer;
		})
		.do((annotationsLayer) => {
			this.annotationsLayer = annotationsLayer;
			this.removeLastSearchPolygon();
		});


	annotationsLayer$: Observable<any> = this.store$
		.select(layersStateSelector)
		.pluck<ILayerState, FeatureCollection<any>>('annotationsLayer')
		.do((annotationsLayer) => this.annotationsLayer = annotationsLayer);


	initEffects() {
		this.subscriptions.push(
			this.polygonSearch$.subscribe(),
			this.annotationsLayer$.subscribe(),
			this.pinPointSearch$.subscribe()
		);
	}

	init(communicator: CommunicatorEntity) {
		super.init(communicator);
		this.initEffects();
	}


	removeLastSearchPolygon() {
		let updatedAnnotationsLayer = <FeatureCollection<any>> { ...this.annotationsLayer };

		remove(updatedAnnotationsLayer.features, function(aFeature)
		{
			return aFeature.properties.id === PolygonSearchVisualizer.lastPolygonSearchId;
		});
		this.store$.dispatch(new SetAnnotationsLayer(updatedAnnotationsLayer));
	}

	onDrawEndEvent({ feature }) {
		this.removeDrawInteraction();
		const geometry = feature.getGeometry();
		const projection = this.iMap.mapObject.getView().getProjection();
		let cloneGeometry = <any> geometry.clone();


		feature.setGeometry(cloneGeometry);

		feature.setProperties({
			id: `${Date.now()}`,
			style: cloneDeep(this.visualizerStyle)
		});

		this.iMap.projectionService
			.projectCollectionAccurately([feature], this.iMap)
			.take(1)
			.subscribe((featureCollection: FeatureCollection<GeometryObject>) => {
				const [geoJsonFeature] = featureCollection.features;
				this.removeLastSearchPolygon();
				let updatedAnnotationsLayer = <FeatureCollection<any>> { ...this.annotationsLayer };
				PolygonSearchVisualizer.lastPolygonSearchId = geoJsonFeature.properties.id;
				updatedAnnotationsLayer.features.push(geoJsonFeature);
				this.store$.dispatch(new SetAnnotationsLayer(updatedAnnotationsLayer));
			});

		if ((cloneGeometry instanceof GeomPolygon))
		{
			let criteria: OverlaysCriteria;
			let polyCoords: any[][] = [];
			const drawedFlatCoordinates = feature.values_.geometry.flatCoordinates;
			polyCoords[0] = [];
			while (drawedFlatCoordinates.length)
			{
				polyCoords[0].push(proj.toLonLat(drawedFlatCoordinates.splice(0, 2), projection));
			}

			criteria = {
				region: {
					'type': 'Polygon',
					'coordinates': polyCoords}};
			this.store$.dispatch(new SetOverlaysCriteriaAction({ region: criteria.region } ) );
		}
	}

	removeDrawInteraction() {
		this.removeInteraction(VisualizerInteractions.drawInteractionHandler);
		this.removeInteraction('drawInteractionHandler');
	}

	constructor(public store$: Store<any>,
				public actions$: Actions) {

		super(null, {
			initial: {
				stroke: {
					color: '#27b2cfe6',
					width: 1
				},
				fill: {
					color: `rgba(255, 255, 255, ${PolygonSearchVisualizer.fillAlpha})`
				},
				point: {
					radius: 4
				},
				line: {
					width: 1
				}
			}
		});
		this.flags$.subscribe((flags: Map<StatusBarFlag, boolean>) => {
			this.flags = new Map(flags);
		});
	}
}
