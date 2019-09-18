import { EventEmitter } from '@angular/core';
import PointerInteraction from 'ol/interaction/Pointer';

export class DragPixelsInteraction extends PointerInteraction {
	startPixel: [number, number];
	currentPixel: [number, number];

	deltaX;
	deltaY;

	onDrag: EventEmitter<[number, number]>;
	onStopDrag: EventEmitter<any>;

	handleDownEvent(args) {
		this.currentPixel[0] = args.coordinate[0];
		this.currentPixel[1] = args.coordinate[1];
		this.startPixel[0] = args.coordinate[0];
		this.startPixel[1] = args.coordinate[1];

		this.deltaX = 0;
		this.deltaY = 0;
		return true;
	}

	handleDragEvent(args) {
		this.deltaX = args.coordinate[0] - this.currentPixel[0];
		this.deltaY = args.coordinate[1] - this.currentPixel[1];

		this.currentPixel[0] = args.coordinate[0];
		this.currentPixel[1] = args.coordinate[1];

		this.onDrag.emit([this.deltaX, this.deltaY]);
		return super.handleDragEvent(args);
	}

	handleUpEvent(args) {
		this.onStopDrag.emit();

		this.startPixel = [0, 0];
		this.currentPixel = [0, 0];
		this.deltaX = 0;
		this.deltaY = 0;

		return super.handleUpEvent(args);
	}

	handleMoveEvent(args) {
		return super.handleMoveEvent(args);
	}

	constructor() {
		super();
		this.startPixel = [0, 0];
		this.currentPixel = [0, 0];
		this.onDrag = new EventEmitter<[number, number]>();
		this.onStopDrag = new EventEmitter<any>();
	}
}
