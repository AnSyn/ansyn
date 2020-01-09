import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { StayInImageryService } from '@ansyn/imagery';

export interface IAnnotationColorProps {
	fill: string;
	stroke: string;
	'stroke-opacity': number;
	'fill-opacity': number;
}

@Component({
	selector: 'ansyn-annotations-color',
	templateUrl: './annotations-color.component.html',
	styleUrls: ['./annotations-color.component.less'],
	providers: [StayInImageryService]
})
export class AnnotationsColorComponent implements AfterViewInit, OnDestroy {
	@Input() show: boolean;
	@Input() strokeModeActive = true;
	@Input() fillModeActive = true;
	@Input() properties: IAnnotationColorProps;
	@Output() activeChange = new EventEmitter();
	@Output() colorChange = new EventEmitter();

	constructor(
		protected myElement: ElementRef,
		protected stayInImageryService: StayInImageryService
	) {
	}

	ngAfterViewInit(): void {
		this.stayInImageryService.init(this.getElement.bind(this));
	}

	getElement() {
		const elements = (this.myElement.nativeElement as Element).getElementsByClassName('list');
		return elements && elements[0];
	}

	ngOnDestroy(): void {
		this.stayInImageryService.destroy();
	}

	getStyle() {
		return { 'transform': `translate(-${ this.stayInImageryService.moveLeft }px, ${ this.stayInImageryService.moveDown }px)` };
	}
}
