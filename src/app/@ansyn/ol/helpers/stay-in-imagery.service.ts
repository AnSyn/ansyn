import { Injectable } from '@angular/core';
import { STATUS_BAR_HEIGHT } from './const';

@Injectable({
	providedIn: 'root'
})
export class StayInImageryService {
	targetElement: Element;
	imageryElement: Element;
	timerId: number;
	public moveLeft = 0;
	public moveDown = 0;

	init(targetElement: Element) {
		this.targetElement = targetElement;
		this.imageryElement = targetElement.closest('.imagery');
		this.timerId = window.setInterval(this.calcPositionToStayInsideImagery.bind(this), 300);
	}

	destroy() {
		window.clearInterval(this.timerId);
	}

	calcPositionToStayInsideImagery() {
		const myRect = this.targetElement.getBoundingClientRect();
		const imageryRect = this.imageryElement.getBoundingClientRect() as DOMRect;

		const deltaForRightEdge = myRect.right - imageryRect.right;
		const deltaForLeftEdge = myRect.left - imageryRect.left;
		if (deltaForRightEdge > 0) {
			this.moveLeft += deltaForRightEdge;
		} else if (deltaForLeftEdge < 0) {
			this.moveLeft += deltaForLeftEdge;
		} else if (deltaForRightEdge !== 0 && deltaForLeftEdge !== 0) {
			this.moveLeft = 0;
		}

		const deltaForBottomEdge = myRect.bottom - imageryRect.bottom + STATUS_BAR_HEIGHT;
		const deltaForTopEdge = imageryRect.top - myRect.top + STATUS_BAR_HEIGHT;
		if (deltaForBottomEdge > 0) {
			this.moveDown -= deltaForBottomEdge;
		} else if (deltaForTopEdge > 0) {
			this.moveDown += deltaForTopEdge;
		} else if (deltaForTopEdge !== 0 && deltaForBottomEdge !== 0) {
			this.moveDown = 0;
		}
	}

}
