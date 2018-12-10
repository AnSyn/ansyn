import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
	selector: 'ansyn-annotations-color',
	templateUrl: './annotations-color.component.html',
	styleUrls: ['./annotations-color.component.less']
})
export class AnnotationsColorComponent implements OnInit {
	@Input() show: boolean;
	@Input() properties: any = {

	}
	@Output() activeChange = new EventEmitter();
	@Output() colorChange = new EventEmitter();


	constructor() {
	}

	ngOnInit() {

	}

}
