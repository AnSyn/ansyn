/**
 * Created by AsafMas on 10/05/2017.
 */
import { Component, OnInit, ViewChild } from '@angular/core';
import { ImageryCommunicatorService, IMapPlugin } from '@ansyn/imagery';
import { Store } from '@ngrx/store';
import { SelectCaseByIdAction, UpdateCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { LoadOverlaysAction, SetSpecialObjectsActionStore } from '@ansyn/overlays/actions/overlays.actions';
import { Case } from '@ansyn/menu-items/cases';
import { OverlaysCriteria } from '@ansyn/overlays/models/overlay.model';
import { ICasesState } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { cloneDeep, isEqual } from 'lodash';

import 'rxjs/add/operator/distinctUntilChanged';
import { OverlaySpecialObject } from '@ansyn/core/models/overlay.model';
import { AnnotationVisualizerAgentAction } from '@ansyn/menu-items/tools/actions/tools.actions';

@Component({
	selector: 'ansyn-map-sand-box',
	templateUrl: './imagery-sand-box.component.html'


})
export class ImagerySandBoxComponent implements OnInit {
	public overlaysFrom;
	public overlaysTo;
	public selectedCase: Case;
	public overlaysCriteria: OverlaysCriteria;
	public isSpecialDisplayed = false;
	private _isMouseShadowEnabled = false;
	@ViewChild('showAnnotations') showAnnotations;

	constructor(public imageryCommunicatorService: ImageryCommunicatorService, public store: Store<ICasesState>) {

	}

	public ngOnInit() {
		this.store.select('cases')
			.distinctUntilChanged(isEqual)
			.subscribe((cases: ICasesState) => {
				this.selectedCase = cloneDeep(cases.selected_case);
				this.overlaysFrom = this.selectedCase.state.time.from.split('T')[0];
				this.overlaysTo = this.selectedCase.state.time.to.split('T')[0];
			});
	}

	public showAnnotationsChange($event) {
		if (this.showAnnotations.nativeElement.checked) {
			this.store.dispatch(new AnnotationVisualizerAgentAction({
				action: 'show',
				maps: 'all'
			}));
		} else {
			this.store.dispatch(new AnnotationVisualizerAgentAction({
				action: 'removeLayer',
				maps: 'all'
			}));
		}
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
		comms.forEach((comm) => {
			const plugin: IMapPlugin = comm.getPlugin('openLayerCenterMarker');
			plugin.isEnabled = !plugin.isEnabled;
		});
	}

	public togglePointerMoveEvent() {
		// TODO take from active
		this._isMouseShadowEnabled = !this._isMouseShadowEnabled;
		const communicators = this.imageryCommunicatorService.communicators;
		const key = Object.keys(communicators)[0];
		communicators[key].setMouseShadowListener(this._isMouseShadowEnabled);
		communicators[key]['pointerMove'].subscribe(latLon => {
			this.drawShadowMouse(latLon);
		});
	}

	public startListenToPointerMove() {
		const communicators = this.imageryCommunicatorService.communicators;
		const key = Object.keys(communicators)[1];
		communicators[key].toggleMouseShadowVectorLayer();
	}

	public drawShadowMouse(latLon) {
		const communicators = this.imageryCommunicatorService.communicators;
		const key = Object.keys(communicators)[1];
		communicators[key].drawShadowMouse(latLon);
	}

	public reloadOverlays($event) {
		const from = new Date(this.overlaysFrom);
		const to = new Date(this.overlaysTo);
		this.selectedCase.state.time = {
			to: to.toISOString(),
			from: from.toISOString(),
			type: 'absolute'
		};
		this.store.dispatch(new UpdateCaseAction(this.selectedCase));
		this.overlaysCriteria = {
			to: this.selectedCase.state.time.to,
			from: this.selectedCase.state.time.from,
			polygon: this.selectedCase.state.region
		};
		this.store.dispatch(new LoadOverlaysAction(this.overlaysCriteria));
	}

	public toggleSpecialObject() {
		const specialObject: OverlaySpecialObject = {
			id: 'abcd',
			date: new Date(2016, 6, 12),
			shape: 'star'
		} as  OverlaySpecialObject;
		this.store.dispatch(new SetSpecialObjectsActionStore([specialObject]));
	}


	public insertContextEntity() {
		this.selectedCase.state.contextEntities = [];

		const feature: GeoJSON.Feature<any> = {
			'type': 'Feature',
			'properties': {},
			'geometry': {
				'type': 'Polygon',
				'coordinates': [
					[
						[
							35.71991824722275,
							32.709192409794866
						],
						[
							35.64566531753454,
							32.093992011030576
						],
						[
							36,
							32.093992011030576
						],
						[
							35.71991824722275,
							32.709192409794866
						]
					]
				]
			}
		};

		this.selectedCase.state.contextEntities.push({
			id: '1',
			date: new Date('2015-04-17T03:55:12.129Z'),
			featureJson: feature
		});
		this.store.dispatch(new UpdateCaseAction(this.selectedCase));
		this.store.dispatch(new SelectCaseByIdAction(this.selectedCase.id));
	}
}
