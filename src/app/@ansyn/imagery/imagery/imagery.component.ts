import { Component, Input, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ICaseMapState } from '../model/case.model';
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
		this.communicator.mapComponentElem = value
	}

	@Input()
	set settings(value: ICaseMapState) {
		this.communicator.mapSettings = value;
	};

	constructor(public communicator: CommunicatorEntity) {
	}

	ngOnInit() {
		this.communicator.ngOnInit();
	}
}
