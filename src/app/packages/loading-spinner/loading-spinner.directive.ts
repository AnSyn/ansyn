/**
 * Created by AsafMas on 15/06/2017.
 */
import { Directive, ElementRef, EventEmitter, HostListener, Input, Output, Renderer2 } from '@angular/core';
import * as _ from 'lodash';
import { DomSanitizer } from '@angular/platform-browser';

@Directive({
	selector: '[ansynLoadingSpinner]'

})
export class LoadingSpinnerDirective {

		private svg_string = `
		<svg class="spinner" width="65px" height="65px" viewBox="0 0 66 66">
			<circle class="path" fill="none" stroke-width="6" stroke-linecap="round" cx="33" cy="33" r="30"></circle>
		</svg>
		`;

	private _isSpinnerActive = false;
	private _spinnerElement: HTMLElement;
	constructor(private elementRef: ElementRef, private renderer: Renderer2, private sanitizer: DomSanitizer) {
		this.createSpinnerElement(elementRef);
		// const parser = new DOMParser();
		// this._spinnerElement = <HTMLElement>parser.parseFromString(this.svg_string, "image/svg+xml").childNodes[0];
		// this.renderer.addClass(this._spinnerElement, 'spinner')
		// this.renderer.appendChild(elementRef.nativeElement, this._spinnerElement);
	}

	private createSpinnerElement(elementRef: ElementRef) {
		//this._spinnerElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		this._spinnerElement = this.renderer.createElement('svg');

		this.renderer.setAttribute(this._spinnerElement, 'width', '65px');
		this.renderer.setAttribute(this._spinnerElement, 'height', '65px');
		this.renderer.setAttribute(this._spinnerElement, 'vinoneewBox', '0 0 66 66');
		this.renderer.addClass(this._spinnerElement, 'spinner');

		const circleElement = this.renderer.createElement('circle');
		this.renderer.addClass(circleElement, 'path');
		this.renderer.setAttribute(circleElement, 'fill', 'none');
		this.renderer.setAttribute(circleElement, 'stroke-width', '6');
		this.renderer.setAttribute(circleElement, 'stroke-linecap', 'round');

		this.renderer.setAttribute(circleElement, 'cx', '33');
		this.renderer.setAttribute(circleElement, 'cy', '33');
		this.renderer.setAttribute(circleElement, 'r', '30');

		this.renderer.appendChild(this._spinnerElement, circleElement);
		this.renderer.appendChild(elementRef.nativeElement, this._spinnerElement);
	}

	@Input()
	public set active(isSpinnerActive: boolean) {
		this._isSpinnerActive = isSpinnerActive
		if (this._isSpinnerActive) {
			this.renderer.addClass(this._spinnerElement, "show");
		} else {
			this.renderer.removeClass(this._spinnerElement, "show");
		}
	}

	public get active() {
		return this._isSpinnerActive;
	}

}
