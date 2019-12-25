import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

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
export class AnnotationsColorComponent implements OnInit, AfterViewInit, OnDestroy {
	@Input() show: boolean;
	@Input() strokeModeActive = true;
	@Input() fillModeActive = true;
	@Input() properties: IAnnotationColorProps;
	@Output() activeChange = new EventEmitter();
	@Output() colorChange = new EventEmitter();


	timerId: number;
	imageryElement: Element;
	moveLeft = 0;

	constructor(protected myElement: ElementRef) {
	}

	ngOnInit(): void {
	}

	ngAfterViewInit(): void {
		this.imageryElement = (this.myElement.nativeElement as HTMLElement).closest('.imagery');
		if (this.imageryElement) {
			this.timerId = window.setInterval(this.calcPosition.bind(this), 300);
		}
	}

	ngOnDestroy(): void {
		if (this.timerId) {
			window.clearInterval(this.timerId);
		}
	}

	calcPosition() {
		const myRect = this.myElement.nativeElement.getBoundingClientRect();
		const imageryRect = this.imageryElement.getBoundingClientRect() as DOMRect;
		const delta = myRect.left - imageryRect.left + myRect.width - imageryRect.width + 3;
		if (delta > 0) {
			this.moveLeft += delta;
		} else {
			this.moveLeft = Math.max(0, this.moveLeft + delta);
		}
	}

	getStyle() {
		return { 'transform': `translate(-${ this.moveLeft }px)` };
	}
}
