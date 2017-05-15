/**
 * Created by AsafMasa on 25/04/2017.
 */
import {
	Component, ElementRef, Input, OnInit, OnDestroy, ViewChild, ViewContainerRef, ComponentRef,
	ComponentFactoryResolver, Type
} from '@angular/core';
import { ImageryProviderService } from '../imageryProviderService/imageryProvider.service';
import { ImageryManager } from '../manager/imageryManager';
import { ImageryCommunicatorService } from '../api/imageryCommunicator.service';
import {ImageryComponentSettings} from './imageryComponentSettings';
import { IMap, IMapComponent } from '../model/model';

@Component({
	selector: 'imagery-view',
	template: `
		<ng-template #map_component_elem></ng-template>
	`
})

export class ImageryComponent implements OnInit, OnDestroy {

	@ViewChild('map_component_elem', {read: ViewContainerRef}) map_component_elem: ViewContainerRef;
	@Input() public mapComponentSettings: ImageryComponentSettings;
	private _mapComponentRef: ComponentRef<any>;
	private _manager: ImageryManager;

	constructor(private imageryCommunicatorService: ImageryCommunicatorService,
				private componentFactoryResolver: ComponentFactoryResolver,
				private imageryProviderService: ImageryProviderService) {
	}

	ngOnInit() {
		if (!this.mapComponentSettings) {
			console.error('mapComponentSettings is Needed!');
			return;
		}

		const imageryCommunicator = this.imageryCommunicatorService.provideCommunicator(this.mapComponentSettings.mapComponentId);
		this._manager = new ImageryManager(this.mapComponentSettings.mapComponentId, this.imageryProviderService,
			this.componentFactoryResolver, this.map_component_elem,
			this._mapComponentRef);
		this._manager.setActiveMap(this.mapComponentSettings.mapSettings[0].mapType);
		imageryCommunicator.init(this._manager);
	}

	ngOnDestroy() {

		if (this._manager) {
			this.imageryCommunicatorService.removeCommunicator(this.mapComponentSettings.mapComponentId);
			this._manager.dispose();
		}
	}
}
