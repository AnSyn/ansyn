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
import { ImageryProviderService } from '../provider-service/imagery-provider.service';
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

	@ViewChild('mapComponentElem', { read: ViewContainerRef }) mapComponentElem: ViewContainerRef;
	@Input() public mapComponentSettings: CaseMapState;

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
			this.mapComponentSettings.id
		);

		this._manager.setActiveMap(this.mapComponentSettings.mapType, this.mapComponentSettings.data.position).then(() => {
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
