import { Injectable, OnDestroy, OnInit, ElementRef } from '@angular/core';
import { Subscription, fromEvent, Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';

@Injectable({
	providedIn: 'root'
})
export class ClickOutsideService{
	constructor(protected element: ElementRef) {
	}


	onClickOutside(targetElement?: any): Observable<boolean> { // classQuery is the class of the element that toggle this.element
		return fromEvent(targetElement || window, 'click').pipe(
			map( (event: MouseEvent) => {
				let shouldNotCallback = this.check(this.element.nativeElement.children, event.target);
				return !shouldNotCallback;
			})
		)
	}


	check(children, srcElement): boolean {
		// we use this loop instead of path.include for chrome 44
		let shouldNotCallback = false;
		for (let i = 0; i < children.length && !shouldNotCallback; i++) {
			const child = children.item(i);
			if ( child.children.length > 0) {
				shouldNotCallback = this.check(child.children, srcElement);
			}
			shouldNotCallback = shouldNotCallback || srcElement === children.item(i);

		}

		return shouldNotCallback;
	}

}
