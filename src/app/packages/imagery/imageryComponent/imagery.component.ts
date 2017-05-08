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
		<template #selected_component_elem></template>
	`
})

export class ImageryComponent implements OnInit, OnDestroy {

	@ViewChild('selected_component_elem', {read: ViewContainerRef}) selected_component_elem: ViewContainerRef;
	@Input() public mapComponentSettings: ImageryComponentSettings;
	private selected_component_ref: ComponentRef<any>;
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

		this.buildCurrentComponent();
	}

	buildCurrentComponent(): void {
		const component = this.imageryProviderService.provideMap(this.mapComponentSettings.mapSettings[0].mapType);
		const factory = this.componentFactoryResolver.resolveComponentFactory(component);

		this.selected_component_ref = this.selected_component_elem.createComponent(factory);

		const mapComponent: IMapComponent = this.selected_component_ref.instance;
		mapComponent.mapCreated.subscribe((map: IMap) => {
			const imageryCommunicator = this.imageryCommunicatorService.provideCommunicator(this.mapComponentSettings.mapComponentId);
			this._manager = new ImageryManager(this.mapComponentSettings.mapComponentId);
			this._manager.setActiveMap(map);

			imageryCommunicator.init(this._manager);
		});
	}

	destroyCurrentComponent(): void {
		if (this.selected_component_ref) {
			this.selected_component_ref.destroy();
			this.selected_component_ref = undefined;
		}
	}



	ngOnDestroy() {

		if (this._manager) {
			this.imageryCommunicatorService.removeCommunicator(this.mapComponentSettings.mapComponentId);
			this._manager.dispose();
		}
	}
}
