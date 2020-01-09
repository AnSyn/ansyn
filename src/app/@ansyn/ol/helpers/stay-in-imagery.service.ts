import { Inject, Injectable } from '@angular/core';
import { IMAGERY_CONFIG } from '@ansyn/imagery';
import { IImageryConfig } from '../../imagery/model/iimagery-config';

@Injectable()
export class StayInImageryService {
	getElementFunc: Function;
	timerCallback: Function;
	timerId: number;
	verticalPadding = this.imageryConfig.stayInImageryVerticalPadding || 35;
	public moveLeft = 0;
	public moveDown = 0;

	constructor(@Inject(IMAGERY_CONFIG) protected imageryConfig: IImageryConfig) {
	}

	init(funcOrElement: Function | Element, timerCallback: Function = null) {
		this.getElementFunc = funcOrElement instanceof Function ? funcOrElement : () => funcOrElement;
		this.timerCallback = timerCallback;
		this.timerId = window.setInterval(this.calcPositionToStayInsideImagery.bind(this), 300);
	}

	destroy() {
		window.clearInterval(this.timerId);
	}

	calcPositionToStayInsideImagery() {
		const targetElement = this.getElementFunc();
		if (!targetElement) {
			return;
		}
		const imageryElement = targetElement.closest('.imagery');

		const myRect = targetElement.getBoundingClientRect();
		const imageryRect = imageryElement.getBoundingClientRect() as DOMRect;

		const deltaForRightEdge = myRect.right - imageryRect.right;
		const deltaForLeftEdge = myRect.left - imageryRect.left;
		if (deltaForRightEdge > 0) {
			this.moveLeft += deltaForRightEdge;
		} else if (deltaForLeftEdge < 0) {
			this.moveLeft += deltaForLeftEdge;
		} else if (deltaForRightEdge !== 0 && deltaForLeftEdge !== 0) {
			this.moveLeft = 0;
		}

		const deltaForBottomEdge = myRect.bottom - imageryRect.bottom + this.verticalPadding;
		const deltaForTopEdge = imageryRect.top - myRect.top + this.verticalPadding;
		if (deltaForBottomEdge > 0) {
			this.moveDown -= deltaForBottomEdge;
		} else if (deltaForTopEdge > 0) {
			this.moveDown += deltaForTopEdge;
		} else if (deltaForTopEdge !== 0 && deltaForBottomEdge !== 0) {
			this.moveDown = 0;
		}

		if (this.timerCallback) {
			this.timerCallback();
		}
	}

}
