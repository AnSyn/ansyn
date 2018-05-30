import { Directive, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Directive({
	selector: '[ansynClickOutside]'
})
export class ClickOutsideDirective {
	@Output() ansynClickOutside = new EventEmitter();
	@Input() trigger: any;

	@HostListener("window:click", ['$event']) clickOutside($event) {
		const self = $event.path.includes(this.elementRef.nativeElement);
		const trigger = $event.path.includes(this.trigger);
		if (!self && !trigger) {
			this.ansynClickOutside.emit($event)
		}
	}

	constructor(public elementRef: ElementRef) {
	}

}
