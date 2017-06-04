/**
 * Created by AsafMasa on 25/04/2017.
 */
import { Component, Input, OnInit, OnDestroy, ViewChild, ViewContainerRef, ComponentRef,ComponentFactoryResolver, Inject } from '@angular/core';
import { ImageryProviderService } from '../imageryProviderService/imageryProvider.service';
import { ImageryManager } from '../manager/imageryManager';
import { ImageryCommunicatorService, ImageryConfig } from '../api/imageryCommunicator.service';
import { ImageryComponentSettings } from './imageryComponentSettings';
import { IImageryConfig } from '../model/model';
import { MapSourceProviderContainerService } from '@ansyn/map-source-provider';

@Component({
	selector: 'imagery-view',
	templateUrl: './imagery.component.html',
	styleUrls: ['./imagery.component.less']
})

export class ImageryComponent implements OnInit, OnDestroy {

	@ViewChild('map_component_elem', {read: ViewContainerRef}) map_component_elem: ViewContainerRef;

	@Input() public mapComponentSettings: ImageryComponentSettings;

	private _mapComponentRef: ComponentRef<any>;

	private _manager: ImageryManager;

	ngOnInit() {
		if (!this.mapComponentSettings) {
			console.error('mapComponentSettings is Needed!');
			return;
		}
		const imageryCommunicator = this.imageryCommunicatorService.provideCommunicator(this.mapComponentSettings.id);

		this._manager = new ImageryManager(this.mapComponentSettings.id, this.imageryProviderService,
			this.componentFactoryResolver, this.map_component_elem,
			this._mapComponentRef, this.mapSourceProviderContainerService, this.config, this.mapComponentSettings, imageryCommunicator);
		this._manager.setActiveMap(this.mapComponentSettings.mapType, this.mapComponentSettings.data.position);

		imageryCommunicator.init(this._manager);
	}

	constructor(private imageryCommunicatorService: ImageryCommunicatorService,
				private componentFactoryResolver: ComponentFactoryResolver,
				private imageryProviderService: ImageryProviderService,
				private mapSourceProviderContainerService: MapSourceProviderContainerService,
				@Inject(ImageryConfig) private config:IImageryConfig) {
	}

	ngOnDestroy() {
		if (this._manager) {
			this.imageryCommunicatorService.removeCommunicator(this.mapComponentSettings.id);
			this._manager.dispose();
		}
	}
}
