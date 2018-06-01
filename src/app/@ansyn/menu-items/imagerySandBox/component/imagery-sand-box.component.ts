import { Component, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { UpdateCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { LoadOverlaysAction, SetSpecialObjectsActionStore } from '@ansyn/overlays/actions/overlays.actions';
import { OverlaysCriteria } from '@ansyn/overlays/models/overlay.model';
import { ICasesState } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { cloneDeep } from 'lodash';
import 'rxjs/add/operator/distinctUntilChanged';
import { OverlaySpecialObject } from '@ansyn/core/models/overlay.model';
import { casesStateSelector } from '../../cases/reducers/cases.reducer';
import { Feature, Point } from 'geojson';
import { CenterMarkerPlugin } from '@ansyn/plugins/openlayers/center-marker/center-marker.plugin';
import { Case } from '@ansyn/core/models/case.model';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';

@Component({
	selector: 'ansyn-map-sand-box',
	templateUrl: './imagery-sand-box.component.html',
	styleUrls: ['./imagery-sand-box.component.less']


})
export class ImagerySandBoxComponent implements OnInit {
	public overlaysFrom;
	public overlaysTo;
	public selectedCase: Case;
	public overlaysCriteria: OverlaysCriteria;
	public isSpecialDisplayed = false;
	@ViewChild('showAnnotations') showAnnotations;

	constructor(public imageryCommunicatorService: ImageryCommunicatorService, public store: Store<ICasesState>) {

	}

	public ngOnInit() {
		this.store.select(casesStateSelector)
			.distinctUntilChanged()
			.subscribe((cases: ICasesState) => {
				this.selectedCase = cloneDeep(cases.selectedCase);
				this.overlaysFrom = this.selectedCase.state.time.from.toISOString().split('T')[0];
				this.overlaysTo = this.selectedCase.state.time.to.toISOString().split('T')[0];
			});
	}

	public showAnnotationsChange($event) {
		if (this.showAnnotations.nativeElement.checked) {
		}
	}

	public setCenter(coordinate) {
		console.log(`'setCenter: lat: ${coordinate.lat}, long: ${coordinate.long}'`);

		try {
			const lat = parseFloat(coordinate.lat);
			const long = parseFloat(coordinate.long);

			const geoPoint: Point = {
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
			const plugin = comm.getPlugin<CenterMarkerPlugin>(CenterMarkerPlugin);
			plugin.isEnabled = !plugin.isEnabled;
		});
	}

	public reloadOverlays($event) {
		const from = new Date(this.overlaysFrom);
		const to = new Date(this.overlaysTo);
		this.selectedCase.state.time = {
			to: to,
			from: from,
			type: 'absolute'
		};
		this.store.dispatch(new UpdateCaseAction(this.selectedCase));
		this.overlaysCriteria = <OverlaysCriteria> {
			time: {
				type: 'absolute',
				to: this.selectedCase.state.time.to,
				from: this.selectedCase.state.time.from
			},
			region: this.selectedCase.state.region
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
		const clonedCase = cloneDeep(this.selectedCase);

		clonedCase.state.contextEntities = [];

		const feature: Feature<any> = {
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

		clonedCase.state.contextEntities.push({
			id: '1',
			date: new Date('2015-04-17T03:55:12.129Z'),
			featureJson: feature
		});
		this.store.dispatch(new UpdateCaseAction(clonedCase));
	}
}
