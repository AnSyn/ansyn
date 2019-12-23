import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface IAnnotationColorProps {
	fill: string;
	stroke: string;
	'stroke-opacity': number;
	'fill-opacity': number;
}

@Component({
	selector: 'ansyn-annotations-color',
	templateUrl: './annotations-color.component.html',
	styleUrls: ['./annotations-color.component.less']
})
export class AnnotationsColorComponent {
	@Input() show: boolean;
	@Input() strokeModeActive = true;
	@Input() fillModeActive = true;
	@Input() properties: IAnnotationColorProps;
	@Output() activeChange = new EventEmitter();
	@Output() colorChange = new EventEmitter();


	constructor() {
	}
}
