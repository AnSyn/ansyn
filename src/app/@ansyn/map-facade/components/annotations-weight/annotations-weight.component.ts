import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

export interface IAnnotationWeightProps {
	'stroke-width': number;
}

@Component({
	selector: 'ansyn-annotations-weight',
	templateUrl: './annotations-weight.component.html',
	styleUrls: ['./annotations-weight.component.less']
})
export class AnnotationsWeightComponent implements OnInit {
	@Input() show;
	@Input() properties: IAnnotationWeightProps;

	@Output() selectLineWidth = new EventEmitter();
	lineWidthList: number[] = [1, 2, 3, 4, 5, 6, 7];

	constructor() {
	}

	ngOnInit() {
	}

}
