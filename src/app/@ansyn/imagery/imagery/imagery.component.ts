import { BaseMapSourceProvider } from '@ansyn/imagery/model/base-map-source-provider';
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
import { ImageryComponentManager } from '@ansyn/imagery/imagery/manager/imagery.component.manager';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import { IImageryConfig } from '@ansyn/imagery/model/iimagery-config';
import { ConfigurationToken } from '@ansyn/imagery/model/configuration.token';
import { CaseMapState } from '@ansyn/core/models/case.model';
import {
	IMAGERY_MAP_COMPONENTS,
	ImageryMapComponentConstructor
} from '@ansyn/imagery/model/imagery-map-component';


@Component({
	selector: 'ansyn-imagery-view',
	templateUrl: './imagery.component.html',
	styleUrls: ['./imagery.component.less']
})

export class ImageryComponent implements OnInit, OnDestroy {

	@ViewChild('mapComponentElem', { read: ViewContainerRef }) mapComponentElem: ViewContainerRef;
	@Input() public mapComponentSettings: CaseMapState;

	private _mapComponentRef: ComponentRef<any>;
	private _manager: ImageryComponentManager;

	ngOnInit() {
		if (!this.mapComponentSettings) {
			console.error('mapComponentSettings is Needed!');
			return;
		}

		this._manager = new ImageryComponentManager(
			this.imageryMapComponents,
			this.componentFactoryResolver,
			this.imageryCommunicatorService,
			this.mapComponentElem,
			this._mapComponentRef,
			this.baseSourceProviders,
			this.config,
			this.mapComponentSettings.id
		);

		this._manager.setActiveMap(this.mapComponentSettings.mapType, this.mapComponentSettings.data.position).then(() => {
			this.imageryCommunicatorService.createCommunicator(this._manager);
		});
	}

	constructor(protected imageryCommunicatorService: ImageryCommunicatorService,
				protected componentFactoryResolver: ComponentFactoryResolver,
				@Inject(IMAGERY_MAP_COMPONENTS) protected imageryMapComponents: ImageryMapComponentConstructor[],
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
