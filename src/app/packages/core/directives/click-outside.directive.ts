import {Directive, ElementRef, Output, EventEmitter, HostListener} from '@angular/core';

@Directive({
	selector: '[ansynClickOutside]'
})
export class ClickOutsideDirective {
	@Output('ansynClickOutside') public ansynClickOutside = new EventEmitter<MouseEvent>();

	@HostListener('document:click', ['$event', '$event.target'])
	public onClick(event: MouseEvent, targetElement: HTMLElement): void {
		if (!targetElement) {
			return;
		}

		const clickedInside = this._elementRef.nativeElement.contains(targetElement);
		if (!clickedInside) {
			this.ansynClickOutside.emit(event);
		}
	}



	constructor(private _elementRef: ElementRef) {
		console.log("click outside");
	}


}
