import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

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
export class AnnotationsColorComponent implements OnInit {
	@Input() show: boolean;
	@Input() properties: IAnnotationColorProps;
	@Output() activeChange = new EventEmitter();
	@Output() colorChange = new EventEmitter();


	constructor(public translate: TranslateService) {
	}

	ngOnInit() {

	}

}
