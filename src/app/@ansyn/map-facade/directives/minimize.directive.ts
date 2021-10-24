import { Directive, ElementRef, Input } from '@angular/core';
import { Store } from '@ngrx/store';

@Directive({
	selector: '[ansynMinimize]'
})
export class MinimizeDirective {
	readonly btn: HTMLButtonElement = document.createElement('button');
	readonly iconDiv: HTMLDivElement = document.createElement('div');
	@Input() onToggle: () => void;
	private _startDegRotate: number;
	private _endDegRotate: number;

	@Input() set toBottom(val: boolean) {
		this._startDegRotate = val ? 0 : 180;
		this._endDegRotate = val ? 180 : 0;

	};

	_minimize = false;

	get minimize() {
		return this._minimize;
	}

	set minimize(mini) {
		this._minimize = mini;
		this.btn.setAttribute('tooltip-value', this._minimize ? 'show' : 'hide');
		this.iconDiv.style.transform = `rotateX(${ this.minimize ? this._endDegRotate : this._startDegRotate }deg)`;
	};

	constructor(private el: ElementRef, private store: Store) {
		this.iconDiv.innerHTML = `<i class="icon-footer-toggle small-icon"></i>`;
		this.iconDiv.style.transform = `rotateX(${this._startDegRotate}deg)`;
		this.btn.appendChild(this.iconDiv);
		this.btn.setAttribute('tooltip-class', 'top');
		this.updateStyle();
		this.btn.onclick = this.toggle.bind(this);
		this.el.nativeElement.appendChild(this.btn);
	}

	toggle() {
		this.minimize = !this.minimize;
		this.onToggle();
	}

	private updateStyle() {
		this.btn.style.position = 'absolute';
		this.btn.style.bottom = 'calc(100% - 6px)';
		this.btn.style.left = '50%';
		this.btn.style.width = '60px';
		this.btn.style.color = 'white';
		this.btn.style.transform = 'translateX(-50%)';
		this.btn.style.border = 'none';
		this.btn.style.boxShadow = '2px 0 4px -2px black';
		this.btn.style.outline = 'none';
		this.btn.style.transition = '.5s';
		this.btn.style.zIndex = '1000';
		this.btn.style.visibility = 'visible';
		this.btn.style.background = '#0e0e0e';
	}
}

