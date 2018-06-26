import { BaseMapSourceProvider } from '@ansyn/imagery/model/base-map-source-provider';
import {
	Component,
	ComponentFactoryResolver,
	ComponentRef,
	Inject, Injector,
	Input,
	OnDestroy,
	OnInit,
	ViewChild,
	ViewContainerRef
} from '@angular/core';
import { ImageryComponentManager } from '@ansyn/imagery/imagery/manager/imagery.component.manager';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import { CaseMapState } from '@ansyn/core/models/case.model';
import { IMapConstructor } from '@ansyn/imagery/model/imap';
import { IMAGERY_IMAP } from '@ansyn/imagery/model/imap-collection';

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
			this.injector,
			this.iMapConstructors,
			this.componentFactoryResolver,
			this.imageryCommunicatorService,
			this.mapComponentElem,
			this._mapComponentRef,
			this.baseSourceProviders,
			this.mapComponentSettings,
		);

		this._manager.setActiveMap(this.mapComponentSettings.mapType, this.mapComponentSettings.data.position).then(() => {
			this.imageryCommunicatorService.createCommunicator(this._manager);
		});
	}

	constructor(protected imageryCommunicatorService: ImageryCommunicatorService,
				protected componentFactoryResolver: ComponentFactoryResolver,
				@Inject(IMAGERY_IMAP) protected iMapConstructors: IMapConstructor[],
				@Inject(BaseMapSourceProvider) protected baseSourceProviders: BaseMapSourceProvider[],
				protected injector: Injector) {
	}

	ngOnDestroy() {
		if (this._manager) {
			this.imageryCommunicatorService.remove(this._manager.id);
			this._manager.dispose();
		}
	}
}
