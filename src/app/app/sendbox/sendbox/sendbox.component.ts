import { Component, OnInit } from '@angular/core';
import { AnsynApi } from '@ansyn/ansyn';

@Component({
	selector: 'ansyn-sendbox',
	templateUrl: './sendbox.component.html',
	styleUrls: ['./sendbox.component.less']
})
export class SendboxComponent implements OnInit {

	constructor(protected ansynApi: AnsynApi) {
		console.log(ansynApi)
	}

	ngOnInit() {
	}

}
