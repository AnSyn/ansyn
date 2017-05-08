/**
 * Created by AsafMasa on 25/04/2017.
 */
import { Component, ElementRef, Input, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ImageryMapProvider } from '../imageryMapProvider/imageryMapProvider';
import { ImageryManager } from '../manager/imageryManager';
import { ImageryCommunicatorService } from '../api/imageryCommunicatorService';
import {ImageryComponentSettings} from './imageryComponentSettings';

@Component({
	selector: 'imagery-view',
	template: `
		<div #imagery></div>
	`,
	styles: [
		`div{
			width: 100%;
			height: 100%;
		}`
	]
})

export class ImageryComponent implements OnInit, OnDestroy {

	@ViewChild('imagery') imageryElement: ElementRef;
	@Input() public mapComponentSettings: ImageryComponentSettings;

	private _manager: ImageryManager;

	constructor(private imageryCommunicatorService: ImageryCommunicatorService) {
	}

	ngOnInit() {
		const imageryProvider: ImageryMapProvider = new ImageryMapProvider();
		if (!this.mapComponentSettings) {
			console.error('mapComponentSettings is Needed!');
			return;
		}
		const element = document.createElement('div');
		element.id = 'openLayersMap';
		element.style.width = '100%';
		element.style.height = '100%';
		this.imageryElement.nativeElement.appendChild(element);

		const imageryCommunicator = this.imageryCommunicatorService.getImageryCommunicator(this.mapComponentSettings.mapComponentId);
		this._manager = new ImageryManager(this.mapComponentSettings.mapComponentId);
		const olMap = imageryProvider.provideMapForMapType(element.id, this.mapComponentSettings.mapComponentId);
		this._manager.setActiveMap(olMap);

		imageryCommunicator.setImageryManager(this._manager);
	}

	ngOnDestroy() {

		if (this._manager) {
			this.imageryCommunicatorService.removeImageryCommunicator(this.mapComponentSettings.mapComponentId);
			this._manager.dispose();
		}
	}
}
