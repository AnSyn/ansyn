import { Component, Input, OnInit } from '@angular/core';

@Component({
	selector: 'ansyn-imagery-status',
	templateUrl: './imagery-status.component.html',
	styleUrls: ['./imagery-status.component.less']
})
export class ImageryStatusComponent implements OnInit {
	
	@Input() map_id;
	@Input('overlay-name') overlayName;
	@Input() active;

	//if not active show button follow 
	constructor() { }
	
	ngOnInit() {
	}

	followActiveMap(event){
		event.stopPropagation();
		console.log('f');
	}

}
