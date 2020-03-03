import { Inject, Injectable, OnDestroy } from '@angular/core';
import { IImageryConfig } from '../model/iimagery-config';
import { IMAGERY_CONFIG } from '../model/configuration.token';

@Injectable()
export class StayInImageryService implements OnDestroy {
	elementCallback: Function;
	timerCallback: Function;
	timerId: number;
	verticalPadding = this.imageryConfig.stayInImageryVerticalPadding || 0;
	public moveLeft = 0;
	public moveDown = 0;

	constructor(@Inject(IMAGERY_CONFIG) protected imageryConfig: IImageryConfig) {
	}

	init(elementOrElementCallback: Function | Element, timerCallback: Function = null) {
		this.elementCallback = elementOrElementCallback instanceof Function ? elementOrElementCallback : () => elementOrElementCallback;
		this.timerCallback = timerCallback;
		this.timerId = window.setInterval(this.calcPositionToStayInsideImagery.bind(this), 300);
	}

	ngOnDestroy(): void {
		if (this.timerId) {
			window.clearInterval(this.timerId);
		}
	}

	calcPositionToStayInsideImagery() {
		const targetElement = this.elementCallback();
		if (!targetElement) {
			return;
		}
		const imageryElement = targetElement.closest('.imagery');
		if (!imageryElement) {
			return;
		}

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
