import { BaseMapSourceProvider } from '../model/base-source-provider.model';
import {
	Component,
	ComponentFactoryResolver,
	ComponentRef,
	Inject,
	Input,
	OnDestroy,
	OnInit,
	ViewChild,
	ViewContainerRef
} from '@angular/core';
import { ImageryProviderService } from '../provider-service/provider.service';
import { ImageryComponentManager } from './manager/imagery.component.manager';
import { ImageryCommunicatorService } from '../communicator-service/communicator.service';
import { IImageryConfig } from '../model/iimagery-config';
import { ConfigurationToken } from '../configuration.token';
import { isEqual, isNil } from 'lodash';
import 'rxjs/add/operator/take';
import { CaseMapState } from '@ansyn/core/models/case.model';


@Component({
	selector: 'ansyn-imagery-view',
	templateUrl: './imagery.component.html',
	styleUrls: ['./imagery.component.less']
})

export class ImageryComponent implements OnInit, OnDestroy {

	private _mapComponentSettings: CaseMapState;

	@ViewChild('mapComponentElem', { read: ViewContainerRef }) mapComponentElem: ViewContainerRef;

	@Input()
	set mapComponentSettings(value) {
		// ngOnInit first
		if (isNil(this._mapComponentSettings)) {
			this._mapComponentSettings = value;
			return;
		}

		// id has been change
		if (!isEqual(this._mapComponentSettings.id, value.id)) {
			if (this._manager) {
				this.imageryCommunicatorService.replaceCommunicatorId(this._mapComponentSettings.id, value.id);
			}
		}

		// position has been change
		if (!isEqual(this._mapComponentSettings.data.position, value.data.position)) {
			if (this._manager) {
				this._manager.ActiveMap.setPosition(value.data.position);
			}
		}

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

		this._manager = new ImageryComponentManager(
			this.imageryProviderService,
			this.componentFactoryResolver,
			this.mapComponentElem,
			this._mapComponentRef,
			this.baseSourceProviders,
			this.config,
			this._mapComponentSettings.id
		);

		this._manager.setActiveMap(this.mapComponentSettings.mapType, this.mapComponentSettings.data.position).take(1).subscribe(res => {
			this.imageryCommunicatorService.createCommunicator(this._manager);
		});
	}

	constructor(protected imageryCommunicatorService: ImageryCommunicatorService,
				protected componentFactoryResolver: ComponentFactoryResolver,
				protected imageryProviderService: ImageryProviderService,
				@Inject(BaseMapSourceProvider) protected baseSourceProviders: BaseMapSourceProvider[],
				@Inject(ConfigurationToken) protected config: IImageryConfig) {
	}

	ngOnDestroy() {
		if (this._manager) {
			this.imageryCommunicatorService.remove(this._manager.id);
			this._manager.dispose();
		}
	}
}
