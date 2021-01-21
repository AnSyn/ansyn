import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
	selector: 'ansyn-annotation-label',
	templateUrl: './annotation-label.component.html',
	styleUrls: ['./annotation-label.component.less']
})
export class AnnotationLabelComponent implements OnInit {
	optionalSize = [10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72];
	@Output() onChangeText = new EventEmitter();
	@Output() onChangeSize = new EventEmitter();
	@Output() onTranslateClick = new EventEmitter();
	@Input() label;
	@Input() labelSize: number;
	@Input() translateOn: boolean;

	constructor() {
	}

	ngOnInit() {
	}
}
