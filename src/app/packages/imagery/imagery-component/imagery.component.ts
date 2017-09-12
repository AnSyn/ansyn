/**
 * Created by AsafMasa on 25/04/2017.
 */
import { BaseMapSourceProvider } from '../model/base-source-provider.model';
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
import { isEqual, isNil, isEmpty } from 'lodash';
import { Subscriber } from 'rxjs/Subscriber';
import 'rxjs/add/operator/take';


@Component({
	selector: 'ansyn-imagery-view',
	templateUrl: './imagery.component.html',
	styleUrls: ['./imagery.component.less']
})

export class ImageryComponent implements OnInit, OnDestroy {

	private _mapComponentSettings: ImageryComponentSettings;

	@ViewChild('map_component_elem', { read: ViewContainerRef }) map_component_elem: ViewContainerRef;

	@Input()
	set mapComponentSettings(value) {
		//ngOnInit first
		if (isNil(this._mapComponentSettings)) {
			this._mapComponentSettings = value;
			return;
		}

		//id has been change
		if (!isEqual(this._mapComponentSettings.id, value.id)) {
			if (this._manager) {
				this.imageryCommunicatorService.replaceCommunicatorId(this._mapComponentSettings.id, value.id);
			}
		}

		//position has been change
		if (!isEqual(this._mapComponentSettings.data.position, value.data.position)) {
			if (this._manager) {
				this._manager.ActiveMap.setPosition(value.data.position);
			}
		}

		// i don't now why it was added i'll mark it and see if we have problems
		// world view
		// if(!isEmpty(this._mapComponentSettings.data.overlay) && isEmpty(value.data.overlay)){
		// 	this._manager.loadInitialMapSource(value.data.position.boundingBox);
		// }

		this._mapComponentSettings = value;
	}

	get mapComponentSettings() {
		return this._mapComponentSettings;
	}


	private _mapComponentRef: ComponentRef<any>;
	private _manager: ImageryComponentManager;

	ngOnInit() {
		if (isNil(this.mapComponentSettings)) {
			console.error('mapComponentSettings is Needed!');
			return;
		}

		this.init();
	}

	private init() {
		this._manager = new ImageryComponentManager(
			this.imageryProviderService,
			this.componentFactoryResolver,
			this.map_component_elem,
			this._mapComponentRef,
			this.baseSourceProviders,
			this.config,
			this._mapComponentSettings.id
		);

		this._manager.setActiveMap(this.mapComponentSettings.mapType, this.mapComponentSettings.data.position).take(1).subscribe(res => {
			this.imageryCommunicatorService.createCommunicator(this._manager);
		});
	}

	constructor(private imageryCommunicatorService: ImageryCommunicatorService,
				private componentFactoryResolver: ComponentFactoryResolver,
				private imageryProviderService: ImageryProviderService,
				@Inject(BaseMapSourceProvider) private baseSourceProviders: BaseMapSourceProvider[],
				@Inject(ConfigurationToken) private config: IImageryConfig) {
	}

	ngOnDestroy() {
		if (this._manager) {
			this.imageryCommunicatorService.remove(this._manager.id);
			this._manager.dispose();
		}
	}
}
