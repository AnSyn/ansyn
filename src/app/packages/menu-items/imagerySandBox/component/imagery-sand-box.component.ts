/**
 * Created by AsafMas on 10/05/2017.
 */
import { Component, OnInit } from '@angular/core';
import { ImageryCommunicatorService, IMapPlugin } from '@ansyn/imagery';
import * as ol from 'openlayers';
import * as turf from '@turf/turf';
import { Store } from '@ngrx/store';
import { UpdateCaseAction } from '../../cases/actions/cases.actions';
import { LoadOverlaysAction } from '../../../overlays/actions/overlays.actions';
import { Case } from "app/packages/menu-items/cases";
import { OverlaysCriteria } from '../../../overlays/models/overlay.model';
import { ICasesState } from '../../cases/reducers/cases.reducer';
import { isEqual,cloneDeep } from 'lodash';

@Component({
	selector: 'ansyn-map-sand-box',
	templateUrl: './imagery-sand-box.component.html'


})
export class ImagerySandBoxComponent implements OnInit {
	public overlaysFrom;
	public overlaysTo;
	public selectedCase:Case;
	public overlaysCriteria: OverlaysCriteria;

	constructor(public imageryCommunicatorService: ImageryCommunicatorService,public store:Store<ICasesState>) {

	}

	public ngOnInit() {
		this.store.select('cases')
			.distinctUntilChanged(isEqual)
			.subscribe((cases:ICasesState) => {
				this.selectedCase = cloneDeep(cases.selected_case);
				this.overlaysFrom = this.selectedCase.state.time.from.split('T')[0];
				this.overlaysTo = this.selectedCase.state.time.to.split('T')[0];
		});
	}

	public setCenter(coordinate) {
		console.log(`'setCenter: lat: ${coordinate.lat}, long: ${coordinate.long}'`);

		try {
			const lat = parseFloat(coordinate.lat);
			const long = parseFloat(coordinate.long);

			const geoPoint: GeoJSON.Point = {
				type: 'Point',
				coordinates: [long, lat]
			};
			this.imageryCommunicatorService.communicatorsAsArray()[0].setCenter(geoPoint, coordinate.animation);
		} catch (ex) {
			throw new Error(`setCenter failed ${ex}`);
		}
	}

	public setWorldLayer() {
		this.imageryCommunicatorService.communicatorsAsArray()[0].loadInitialMapSource();
	}

	public addImageLayer() {
		console.log(`addImageLayer`);

		try {
			const layer = this.createImageLayer();
			this.imageryCommunicatorService.communicatorsAsArray()[0].addLayer(layer);
		} catch (ex) {
			throw new Error(`addImageLayer failed ${ex}`);
		}
	}

	public setImageLayer() {
		console.log(`setImageLayer`);

		// try {
		const layer = this.createImageLayer();

		const footprint:GeoJSON.MultiPolygon = {"type":"MultiPolygon","coordinates":[[[[35.66132962,32.71470156],[35.84337173,32.71244083],[35.84258139,32.5720059],[35.6607346,32.57504756],[35.66132962,32.71470156]]]],"bbox":[35.6607346,32.5720059,35.84337173,32.71470156]};

		const a: GeoJSON.Feature<any> = {
			"type": 'Feature',
			"properties": {},
			"geometry": footprint
		};

		const center = turf.center(a);
		const bbox = turf.bbox(a);
		const bboxPolygon = turf.bboxPolygon(bbox);
		const extent = {topLeft: bboxPolygon.geometry.coordinates[0][0], topRight: bboxPolygon.geometry.coordinates[0][1], bottomLeft: bboxPolygon.geometry.coordinates[0][2], bottomRight:bboxPolygon.geometry.coordinates[0][3]};
		this.imageryCommunicatorService.communicatorsAsArray()[0].setLayer(layer, extent);
		// } catch (ex) {
		// 	throw new Error(`setImageLayer failed ${ex}`);
		// }
	}

	private createImageLayer(): ol.layer.Tile {
		const projection = new ol.proj.Projection({
			code: 'EPSG:4326',
			units: 'degrees',
			axisOrientation: 'neu',
			global: true
		});

		const tiled = new ol.layer.Tile({
			visible: true,
			source: new ol.source.TileWMS({
				url: 'http://localhost:8080/geoserver/ansyn/wms',
				params: {
					'FORMAT': 'image/png',
					'VERSION': '1.1.1',
					tiled: true,
					STYLES: '',
					LAYERS: 'ansyn:israel_center_1',
					tilesOrigin: 34.19140208322269 + ',' + 30.666856822816754
				},
				projection: projection
			})
		});
		return tiled;
	}

	public setActiveMap(mapType: string) {
		this.imageryCommunicatorService.communicatorsAsArray()[0].setActiveMap(mapType);
	}

	private toggleDrawCenterPluggin() {
		const plugin: IMapPlugin = this.imageryCommunicatorService.communicatorsAsArray()[0].getPlugin("openLayerCenterMarker");
		plugin.isEnabled = !plugin.isEnabled;
	}

	public togglePointerMoveEvent() {
		//todo take from active
		const communicators = this.imageryCommunicatorService.communicators;
		const key = Object.keys(communicators)[0];
		communicators[key].toggleMouseShadowListener();
		communicators[key]['pointerMove'].subscribe( latLon => {
			this.drawShadowMouse(latLon);
		});
	}

	public startListenToPointerMove(){
		const communicators = this.imageryCommunicatorService.communicators;
		const key = Object.keys(communicators)[1];
		communicators[key].toggleMouseShadowVectorLayer();
	}

	public drawShadowMouse(latLon){
		const communicators = this.imageryCommunicatorService.communicators;
		const key = Object.keys(communicators)[1];
		communicators[key].drawShadowMouse(latLon);
	}

	public reloadOverlays($event){
		const from  = new Date(this.overlaysFrom);
		const to =  new Date(this.overlaysTo);
		this.selectedCase.state.time = {
			to: to.toISOString(),
			from: from.toISOString(),
			type: 'absolute'
		}
		this.store.dispatch(new UpdateCaseAction(this.selectedCase));
		this.overlaysCriteria = {
			to: this.selectedCase.state.time.to,
			from: this.selectedCase.state.time.from,
			polygon: this.selectedCase.state.region
		} ;
		this.store.dispatch(new LoadOverlaysAction(this.overlaysCriteria));
	}

}
