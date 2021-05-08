import { Injectable, Output, EventEmitter } from '@angular/core';
import { fromEvent } from "rxjs";

@Injectable({providedIn: 'any'})
export class KeysListenerService {

	@Output() keyup = new EventEmitter<KeyboardEvent>();
	@Output() keypress = new EventEmitter<KeyboardEvent>();
	@Output() keydown = new EventEmitter<KeyboardEvent>();
	events: string[] = ['keypress', 'keyup', 'keydown'];

	constructor() {
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

	keyWasUsed(event: KeyboardEvent, key: number): boolean {
		return event.which === key;
	}

	keysWereUsed(event: KeyboardEvent, keys: number[]): boolean {
		return keys.some(key => this.keyWasUsed(event, key));
	}
}
