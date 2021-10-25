import { AfterViewInit, Directive, ElementRef, Input } from '@angular/core';
import { Store } from '@ngrx/store';

@Directive({
	selector: '[ansynMinimize]'
})
export class MinimizeDirective implements AfterViewInit {
	readonly btn: HTMLButtonElement = document.createElement('button');
	readonly iconDiv: HTMLDivElement = document.createElement('div');
	@Input() onToggle: () => void;
	private _startDegRotate = 0;
	private _endDegRotate = 180;
	private _toTop: boolean;
	@Input() set toTop(val: boolean) {
		this._toTop = val;
		this._startDegRotate = val ? 180 : 0;
		this._endDegRotate = val ? 0 : 180;
	};

	topOffset: number;
	_minimize = false;

	get minimize() {
		return this._minimize;
	}

	set minimize(mini) {
		this._minimize = mini;
		this.btn.setAttribute('tooltip-value', this._minimize ? 'show' : 'hide');
		this.iconDiv.style.transform = `rotateX(${ this.minimize ? this._endDegRotate : this._startDegRotate }deg)`;
		this.updatePositionStyle()
	};

	constructor(private el: ElementRef) {
		this.iconDiv.innerHTML = `<i class="icon-footer-toggle small-icon"></i>`;
		this.iconDiv.style.transform = `rotateX(${this._startDegRotate}deg)`;
		this.btn.appendChild(this.iconDiv);
		this.btn.setAttribute('tooltip-class', 'top');
		this.btn.onclick = this.toggle.bind(this);
		this.el.nativeElement.appendChild(this.btn);
	}

	ngAfterViewInit() {
		this.minimize = false;
		this.updateStyle();
		const parentHeight = this.el.nativeElement.offsetHeight;
		const btnHeight = this.btn.offsetHeight;
		this.topOffset = parentHeight - (btnHeight / 2);
		this.updatePositionStyle();
	}

	toggle() {
		this.minimize = !this.minimize;
		this.onToggle();
	}

	private updatePositionStyle() {

		if (this._toTop) {
			this.btn.style.top = this.minimize ? '0' : `${this.topOffset}px`;
		}else {
			this.btn.style.bottom = this.minimize ? '0' : `${this.topOffset}px`;
		}
	}
	private updateStyle() {
		this.btn.style.position = 'absolute';
		this.btn.style.left = '50%';
		this.btn.style.width = '50px';
		this.btn.style.color = 'white';
		this.btn.style.transform = 'translateX(-50%)';
		this.btn.style.border = 'none';
		this.btn.style.borderRadius = '10%';
		this.btn.style.boxShadow = '2px 0 4px -2px black';
		this.btn.style.outline = 'none';
		this.btn.style.transition = '.5s';
		this.btn.style.zIndex = '1000';
		this.btn.style.visibility = 'visible';
		this.btn.style.background = '#0e0e0e';
	}
}

