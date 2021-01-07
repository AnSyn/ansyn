import { EntitiesVisualizer, OpenLayersMap } from '@ansyn/ol';
import { select, Store } from '@ngrx/store';
import { selectMapPositionByMapId } from '@ansyn/map-facade';
import { AutoSubscription } from 'auto-subscriptions';
import { filter, map, take, tap, withLatestFrom, switchMap, retryWhen, delay } from 'rxjs/operators';
import {
	bboxFromGeoJson,
	getNewPoint,
	IImageryMapPosition,
	ImageryVisualizer, IVisualizerEntity,
	MarkerSize, VisualizerInteractions, VisualizerStates,

} from '@ansyn/imagery';
import { Injectable, Inject, ComponentFactoryResolver, Injector, ApplicationRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
	selectLayers,
	selectSelectedLayersIds
} from '../../../../../menu-items/layers-manager/reducers/layers.reducer';
import { ILayer } from '../../../../../menu-items/layers-manager/models/layers.model';
import { point } from '@turf/helpers';
import { of, Observable } from 'rxjs';
import Select from 'ol/interaction/Select';
import { pointerMove } from 'ol/events/condition';
import Overlay from 'ol/Overlay';
import { PopupComponent } from './popup/popup.component';
import { containsExtent } from 'ol/extent';
import squareGrid from '@turf/square-grid'
import { UUID } from 'angular2-uuid';
import olStyle from 'ol/style/Style';
import olStroke from 'ol/style/Stroke';
import olCircle from 'ol/style/Circle';
import olFill from 'ol/style/Fill';
import booleanContains from '@turf/boolean-contains'

interface IPlaceElement {
	type: 'node',
	"id": number,
	"lat": number,
	"lon": number,
	"tags": any
}

const layerId = 'places-layer';
const amenities = ['pub', 'fast_food', 'restaurant', 'bar'];

@ImageryVisualizer({
	supported: [OpenLayersMap],
	deps: [Store, HttpClient, Injector, ApplicationRef, ComponentFactoryResolver],
	dontRestrictToExtent: true,
})
@Injectable()
export class OpenlayersPlacesVisualizer extends EntitiesVisualizer {
	mapData: any = {};
	isEnabled = false;
	popup: {
		component: any,
		ref?: any
	};
	entities: IVisualizerEntity[]
	popupOverlay: Overlay;
	visualizerStyle = {
		opacity: 1,
		initial: {
			'marker-color': '#eeff11',
			'marker-size': MarkerSize.medium
		}
	};
	@AutoSubscription
	isLayerEnable$ = this.store$.pipe(
		select(selectSelectedLayersIds),
		withLatestFrom(this.store$.pipe(select(selectLayers))),
		tap(([selectedLayerId, layers]) => {
			this.layer = selectedLayerId.includes(layerId) ? layers.find(layer => layer.id === layerId) : undefined;
		})
	);

	_layer: ILayer;

	set layer(layer) {
		this.isEnabled = Boolean(layer);
		this._layer = layer;
		this.onPositionChange$().pipe(take(1)).subscribe();
	}

	constructor(protected store$: Store<any>,
				protected http$: HttpClient,
				private injector: Injector,
				private applicationRef: ApplicationRef,
				private componentFactoryResolver: ComponentFactoryResolver) {
		super({}, {})
	}

	@AutoSubscription
	onPositionChange$ = () => this.store$.pipe(
		select(selectMapPositionByMapId(this.mapId)),
		tap(this.clearEntities.bind(this)),
		filter(Boolean),
		switchMap(this.drawPlaces.bind(this))
	);

	drawPlaces(position: IImageryMapPosition): Observable<boolean> {
		if (this.isEnabled && this._layer) {
			this.mapData.zoom = position.projectedState.zoom;
			const bbox = bboxFromGeoJson(position.extentPolygon);
			const isCloserExtent = this.mapData.extent && containsExtent(this.mapData.extent, bbox);
			if (isCloserExtent) {
				return this.calcEntitiesByPosition()
			}
			const body = this.buildBody([bbox[1], bbox[0], bbox[3], bbox[2]]); // we get lon/lat and api need lat/lon
			return this.http$.post(this._layer.url, body, {
				headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
			}).pipe(
				switchMap(({elements}: {elements: IPlaceElement[]}) => {
					this.mapData.extent = bbox;
					this.entities = elements.map( (element) => {
						const id = `${element.id}`;
						const featureJson = point(getNewPoint([element.lon, element.lat]).coordinates, {tags: element.tags});
						return {id, featureJson};
					});

					return this.calcEntitiesByPosition();
				}),
				retryWhen( (err) => err.pipe(
					delay(500),
					tap( error => console.log({error}))
					)
				)
			)
		}
		return of(false);
	}


	calcEntitiesByPosition(): Observable<boolean> {

		if (this.mapData.zoom < 16) {
			const entities: IVisualizerEntity[] = this.getSquareEntitiesFromExtent();
			this.createInteraction(true);
			return this.setEntities(entities);
		}
		else {
			this.createInteraction()
			return this.setEntities(this.entities);

		}
	}

	getSquareEntitiesFromExtent(cellsize = 250): IVisualizerEntity[] {
		const entities: IVisualizerEntity[] = [];
		squareGrid(this.mapData.extent, cellsize, {units: 'meters'}).features.filter( square =>
			this.entities.some( entity => booleanContains(square, entity.featureJson))
		)
			.forEach( square => {
			const id = UUID.UUID();
			const featureJson = { ...square };
			entities.push({ id, featureJson });
		});
		return entities;
	}

	createInteraction(remove = false) {
		if (!remove) {
			const selectInteraction = new Select({
				condition: pointerMove,
				layers: [this.vector]
			});
			selectInteraction.on('select', e => {
				const feature = e.selected[0];
				if (feature) {
					const tags = feature.get('tags');
					this.popup.ref.instance.type = tags?.amenity;
					this.popup.ref.instance.name = tags?.name;
					this.popupOverlay.setPosition(e.mapBrowserEvent.coordinate);
				}
				else {
					this.popupOverlay.setPosition(undefined);
				}
			});
			this.addInteraction(VisualizerInteractions.pointerMove, selectInteraction);
		}
		else {
			this.removeInteraction(VisualizerInteractions.pointerMove);
		}
	}

	featureStyle(feature, state: string = VisualizerStates.INITIAL): any {
		const fill = new olFill({
			color: 'rgb(255, 0, 0, 0.3)'
		});
		const stroke = new olStroke({
			color: 'yellow'
		});

		const style = new olStyle({
			fill,
			stroke,
			image: new olCircle({ fill, stroke, radius: 5 })
		});

		return style;
	}

	onDispose(): void {
		console.log('dispose');
		document.body.removeChild(this.popup.component);
		this.applicationRef.detachView(this.popup.ref.hostView);
		this.iMap.mapObject.removeOverlay(this.popupOverlay);
		this.popup = undefined;
		this.popupOverlay = undefined;
		super.onDispose();
	}

	onInit() {
		console.log('init');
		this.popup = {component: document.createElement('popup-component')};
		const factory = this.componentFactoryResolver.resolveComponentFactory(PopupComponent);
		this.popup.ref = factory.create(this.injector, [], this.popup.component);
		document.body.appendChild(this.popup.component);
		this.applicationRef.attachView(this.popup.ref.hostView);
		this.popupOverlay = new Overlay({
			element: this.popup.component,
			className: 'ansyn-popup'
		});
		this.iMap.mapObject.addOverlay(this.popupOverlay);
		super.onInit();
	}

	onResetView(): Observable<boolean> {
		console.log('reset');
		return super.onResetView();
	}


	private buildBody(bbox) {
		return `[out:json][timeout:25];
(
  ${amenities.map( amenity => `node["amenity"="${amenity}"](${bbox});`).join('\n')}
);
out body;`
	}

}
