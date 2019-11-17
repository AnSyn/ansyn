import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IStroke } from '@ansyn/imagery';

export interface IStyleWeight {
	name: string;
	width: number;
	dash: number;
	preview?: number;
}
export const StyleDictionary: IStyleWeight[] = [
	{
		name: 'solid1',
		width: 1,
		dash: 0
	},
	{
		name: 'solid2',
		width: 2,
		dash: 0
	},
	{
		name: 'solid3',
		width: 3,
		dash: 0
	},
	{
		name: 'solid4',
		width: 4,
		dash: 0
	},
	{
		name: 'solid5',
		width: 5,
		dash: 0
	},
	{
		name: 'solid6',
		width: 6,
		dash: 0
	},
	{
		name: 'solid7',
		width: 7,
		dash: 0
	},
	{
		name: 'dash1',
		width: 3,
		dash: 1,
		preview: 2
	},
	{
		name: 'dash2',
		width: 3,
		dash: 25,
		preview: 5
	}
];

@Component({
	selector: 'ansyn-annotations-weight',
	templateUrl: './annotations-weight.component.html',
	styleUrls: ['./annotations-weight.component.less']
})
export class AnnotationsWeightComponent implements OnInit {
	@Input() show;
	@Input() properties: IStroke;
	@Output() selectLineStyle = new EventEmitter<IStyleWeight>();
	styleList: IStyleWeight[] = StyleDictionary;

	constructor() {
	}

	ngOnInit() {
	}

	isSelect(style: IStyleWeight) {
		return style.width === this.properties['stroke-width'] && style.dash === this.properties['stroke-dasharray'];
	}

	getWidth(style: IStyleWeight) {
		return style.preview ? style.preview : style.width;
	}


	getDashLine(style: IStyleWeight) {
		return style.preview ? style.preview : style.dash % 4;
	}
}
