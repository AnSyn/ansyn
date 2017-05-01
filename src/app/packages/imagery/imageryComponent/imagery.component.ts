/**
 * Created by AsafMasa on 25/04/2017.
 */
import { Component, ElementRef, Input, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ImageryProvider } from '../imageryProvider/imageryProvider';
import { ImageryManager } from '../manager/imageryManager';
import { ImageryCommunicatorService } from '../api/imageryCommunicatorService';
import {MapComponentSettings} from './mapComponentSettings';

@Component({
	moduleId: module.id,
	selector: 'imagery-view',
	template: `
		<div #imagery></div>
	`
})

export class ImageryComponent implements OnInit, OnDestroy {

	@ViewChild('imagery') imageryElement: ElementRef;
	@Input() public mapComponentSettings: MapComponentSettings;

	private _manager: ImageryManager;

	constructor(private imageryCommunicatorService: ImageryCommunicatorService) {
	}

	ngOnInit() {
		const imageryProvider: ImageryProvider = new ImageryProvider();
		if (!this.mapComponentSettings) {
			console.error('mapComponentSettings is Needed!');
			return;
		}
		const element = document.createElement('div');
		element.id = 'openLayersMap';
		this.imageryElement.nativeElement.appendChild(element);

		const imageryCommunicator = this.imageryCommunicatorService.getImageryAPI(this.mapComponentSettings.mapComponentId);
		this._manager = new ImageryManager(this.mapComponentSettings.mapComponentId);
		const olMap = imageryProvider.init(element.id, this.mapComponentSettings.mapComponentId);
		this._manager.setActiveMap(olMap);

		imageryCommunicator.setImageryManager(this._manager);
	}

	ngOnDestroy() {

		if (this._manager) {
			this.imageryCommunicatorService.removeImageryAPI(this.mapComponentSettings.mapComponentId);
			this._manager.dispose();
		}
	}
}
