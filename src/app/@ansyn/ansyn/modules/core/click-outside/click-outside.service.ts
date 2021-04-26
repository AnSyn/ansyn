import { ElementRef, Injectable } from '@angular/core';
import { fromEvent, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({providedIn: 'any'})
export class ClickOutsideService {
	constructor() {
	}

	/**
	 * listen to click event from target and return true if this click happend outside of the monitor element
	 * @param targetElement - the element to attach the click event handler to default window.
	 * @param elementToMonitor - the element we want monitor that the click was outside it default element.nativeElement.
	 */
	onClickOutside(elements: {target?: any, monitor: any}): Observable<boolean> {
		const { target, monitor } = elements;
		return fromEvent(target || window, 'click').pipe(
			map((event: MouseEvent) => {
				const path = event.composedPath ? event.composedPath() : this.getPath(event);
				let clickOutsideMonitor = !(path && path.includes(monitor));
				return clickOutsideMonitor;
			})
		)
	}

	// for chrome44
	private getPath(event) {
		const currentElement = event.target;
		const eventTarget = [currentElement];
		eventTarget.push(...this.getAllParent(currentElement.parentElement));
		return eventTarget;
	}

	private getAllParent(parent: HTMLElement): HTMLElement[] {
		const allParent = [parent];
		if (Boolean(parent && parent.parentElement)) {
			allParent.push(...this.getAllParent(parent.parentElement))
		}
		return allParent;
	}
}
