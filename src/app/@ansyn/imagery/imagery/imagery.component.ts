import { Component, Input, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { CommunicatorEntity } from '../communicator-service/communicator.entity';
import { IMapSettings } from '../model/map-settings';

@Component({
	selector: 'ansyn-imagery-view',
	templateUrl: './imagery.component.html',
	styleUrls: ['./imagery.component.less'],
	providers: [CommunicatorEntity]
})

export class ImageryComponent implements OnInit {
	@ViewChild('mapComponentElem', { read: ViewContainerRef, static: true })
	set mapComponentElem(value: ViewContainerRef) {
		this.communicator.mapComponentElem = value
	}

	@Input()
	set settings(value: IMapSettings) {
		this.communicator.mapSettings = value;
	};

	constructor(public communicator: CommunicatorEntity) {
	}

	ngOnInit() {
		this.communicator.ngOnInit();
	}
}
