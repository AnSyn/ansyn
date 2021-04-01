import { Injectable, Output, EventEmitter, HostListener, OnInit } from '@angular/core';
import { fromEvent } from "rxjs";
import { take } from "rxjs/operators";

@Injectable({providedIn: 'any'})
export class KeysListenerService {

	@Output() keyup = new EventEmitter<KeyboardEvent>();
	@Output() keypress = new EventEmitter<KeyboardEvent>();
	@Output() keydown = new EventEmitter<KeyboardEvent>();
	events: string[] = ['keypress', 'keyup', 'keydown'];

	constructor() {
		console.log("medabeg im hadpasot");
		this.events.forEach(eventName => fromEvent(document, eventName).subscribe(($event: KeyboardEvent ) =>
		{
			if (this.isElementNotValid($event)) {
				return;
			}
			this[`${eventName}`].emit($event)
		}))
	}

	isElementNotValid($event: KeyboardEvent) {
		const {activeElement} = (<Window>$event.view).document;
		return this.isElementInput(activeElement) || this.isTimePicker(activeElement);
	}

	isElementInput(activeElement) {
		return activeElement instanceof HTMLInputElement;
	}

	isTimePicker(activeElement) {
		const {className} = activeElement;
		return className.includes('owl') || className.includes('title');
	}

	keyWasUsed(event: KeyboardEvent, key: string, keycode: number = key.charCodeAt(0)): boolean {
		return event.key === key;// tslint:disable-line
	}

	keysWereUsed(event: KeyboardEvent, keys: string[]): boolean {
		return keys.some(key => this.keyWasUsed(event, key));
	}
}
