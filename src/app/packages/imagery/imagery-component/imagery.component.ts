/**
 * Created by AsafMasa on 25/04/2017.
 */
import {
	Component, Input, OnInit, OnChanges, OnDestroy, ViewChild,
	ViewContainerRef, ComponentRef, ComponentFactoryResolver, Inject, SimpleChanges
} from '@angular/core';
import { ImageryProviderService } from '../provider-service/provider.service';
import { ImageryComponentManager } from './manager/imagery.component.manager';
import { ImageryCommunicatorService } from '../communicator-service/communicator.service';
import { ImageryComponentSettings } from '../model/imagery-component-settings';
import { IImageryConfig } from '../model/iimagery-config';
import { ConfigurationToken } from '../configuration.token';
import { TypeContainerService } from '@ansyn/type-container';

@Component({
	selector: 'ansyn-imagery-view',
	templateUrl: './imagery.component.html',
	styleUrls: ['./imagery.component.less']
})

export class ImageryComponent implements OnInit, OnDestroy, OnChanges {

	@ViewChild('map_component_elem', { read: ViewContainerRef }) map_component_elem: ViewContainerRef;

	@Input() public mapComponentSettings: ImageryComponentSettings;

	private _mapComponentRef: ComponentRef<any>;

	private _manager: ImageryComponentManager;

	ngOnInit() {
		if (!this.mapComponentSettings) {
			console.error('mapComponentSettings is Needed!');
			return;
		}
		const imageryCommunicator = this.imageryCommunicatorService.provideCommunicator(this.mapComponentSettings.id);

		this._manager = new ImageryComponentManager(
			this.mapComponentSettings.id, 
			this.imageryProviderService,
			this.componentFactoryResolver, 
			this.map_component_elem,
			this._mapComponentRef, 
			this.typeContainerService, 
			this.config, 
			imageryCommunicator);

		this._manager.setActiveMap(this.mapComponentSettings.mapType, this.mapComponentSettings.data.position).subscribe( res => {
			imageryCommunicator.init(this._manager);
 		});

	}

	constructor(private imageryCommunicatorService: ImageryCommunicatorService,
		private componentFactoryResolver: ComponentFactoryResolver,
		private imageryProviderService: ImageryProviderService,
		private typeContainerService: TypeContainerService,
		@Inject(ConfigurationToken) private config: IImageryConfig) {
	}

	ngOnDestroy() {
		if (this._manager) {
			this.imageryCommunicatorService.removeCommunicator(this.mapComponentSettings.id);
			this._manager.dispose();
		}
	}

	ngOnChanges(changes) {
		if (this._manager) {
			this._manager.ActiveMap.setPosition(changes.mapComponentSettings.currentValue.data.position);
		}
	}
}
