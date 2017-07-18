/**
 * Created by AsafMas on 10/05/2017.
 */
import { Component, OnInit } from '@angular/core';
import { ImageryCommunicatorService, IMapPlugin } from '@ansyn/imagery';
import * as ol from 'openlayers';
import * as turf from '@turf/turf';
import { Store } from '@ngrx/store';
import { UpdateCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { LoadOverlaysAction } from '@ansyn//overlays/actions/overlays.actions';
import { Case } from "@ansyn/menu-items/cases";
import { OverlaysCriteria } from '@ansyn/overlays/models/overlay.model';
import { ICasesState } from '@ansyn/menu-items/cases/reducers/cases.reducer';
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

	public setActiveMap(mapType: string) {
		this.imageryCommunicatorService.communicatorsAsArray()[0].setActiveMap(mapType);
	}

	public toggleDrawCenterPluggin() {
		const comms = this.imageryCommunicatorService.communicatorsAsArray();
		comms.forEach((comm)=>{
			const plugin: IMapPlugin = comm.getPlugin("openLayerCenterMarker");
			plugin.isEnabled = !plugin.isEnabled;
		});
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
