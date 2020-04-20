import { Injectable, ElementRef } from '@angular/core';
import { fromEvent, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// for chrome44
function getAllParent(parent: HTMLElement): HTMLElement[] {
	const allParent = [parent];
	if (Boolean(parent.parentElement)) {
		allParent.push(...getAllParent(parent.parentElement))
	}
	return allParent;
}
MouseEvent.prototype.composedPath = MouseEvent.prototype.composedPath || function () {
	const currentElement = this.target;
	const eventTarget = [currentElement];
	eventTarget.push(...getAllParent(currentElement.parentElement));
	return eventTarget;
};

@Injectable({
	providedIn: 'root'
})
export class ClickOutsideService{
	constructor(protected element: ElementRef) {
	}

	/**
	 * listen to click event from target and return true if this click happend outside of the monitor element
	 * @param targetElement - the element to attach the click event handler to default window.
	 * @param elementToMonitor - the element we want monitor that the click was outside it default element.nativeElement.
	 */
	onClickOutside(targetElement: any = window, elementToMonitor = this.element.nativeElement): Observable<boolean> {
		return fromEvent(targetElement, 'click').pipe(
			map( (event: MouseEvent) => {
				const path = event.composedPath();
				let clickOutsideMonitor = !(path && path.includes(elementToMonitor));
				return clickOutsideMonitor;
			})
		)
	}

}
