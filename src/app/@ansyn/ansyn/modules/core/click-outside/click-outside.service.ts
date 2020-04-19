import { Injectable, OnDestroy, OnInit, ElementRef } from '@angular/core';
import { Subscription, fromEvent } from 'rxjs';
import { tap, map } from 'rxjs/operators';

@Injectable({
	providedIn: 'root'
})
export class ClickOutsideService{
	clickOutsideSubscription: Subscription;
	open: boolean;

	constructor(protected element: ElementRef) {
		console.log('constructor', element);
	}


	onClickOutside(classQuery?: string) { // classQuery is the class of the element that toggle this.element
		return fromEvent(window, 'click').pipe(
			tap(() => console.log(this.element.nativeElement.tagName)),
			map( event => {
				const target = event.target;
				let queryElement = classQuery && window.document.getElementsByClassName(classQuery);
				let shouldNotCallback = this.check(this.element.nativeElement.children, event.target) || (queryElement && this.check(queryElement, event.target));
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

	bind(callback) {
		this.clickOutsideSubscription = fromEvent(window, 'click').pipe(
			tap( event => {
				let shouldNotCallback = false;
				const children = this.element.nativeElement.children;
				// we use this loop instead of path.include for chrome 44
				for (let i = 0; i < children.length && !shouldNotCallback; i++) {
					shouldNotCallback = event.srcElement === children.item(i);
				}
				if (!shouldNotCallback) {
					callback();
				}
			})
		).subscribe()
	}

	destroy(): void {
		this.clickOutsideSubscription.unsubscribe()
	}

}
