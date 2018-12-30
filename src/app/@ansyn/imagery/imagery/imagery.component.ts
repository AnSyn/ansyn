import { Component, Input, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ICaseMapState } from '@ansyn/core';
import { CommunicatorEntity } from '../communicator-service/communicator.entity';

@Component({
	selector: 'ansyn-imagery-view',
	templateUrl: './imagery.component.html',
	styleUrls: ['./imagery.component.less'],
	providers: [CommunicatorEntity]
})

export class ImageryComponent implements OnInit {
	@ViewChild('mapComponentElem', { read: ViewContainerRef })
	set mapComponentElem(value: ViewContainerRef) {
		this._manager.mapComponentElem = value
	}

	@Input()
	set settings(value: ICaseMapState) {
		this._manager.mapSettings = value;
	};

	constructor(protected _manager: CommunicatorEntity) {
	}

	ngOnInit() {
		this._manager.ngOnInit();
	}
}
