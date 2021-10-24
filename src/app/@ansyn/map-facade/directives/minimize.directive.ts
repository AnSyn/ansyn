import { Directive, ElementRef, Input } from '@angular/core';

@Directive({
	selector: '[ansynMinimize]'
})
export class MinimizeDirective {
	readonly btn: HTMLButtonElement = document.createElement('button');;
	_minimize = false;
	set minimize(mini) {
		this._minimize = mini;
		this.btn.setAttribute('tooltip-value', this._minimize ? 'show' : 'hide');
	};
	get minimize() {
		return this._minimize;
	}
	constructor(private el: ElementRef) {
		/*
		<button
		*ngIf="config?.isFooterCollapsible && !fourViewsMode"
		class="hide-menu"
		(click)="toggle()"
		[attr.tooltip-value]="minimizeText | translate"
		tooltip-class="top">
		<div [class.show]="collapse"><i class="icon-footer-toggle small-icon"></i></div>
	</button>
		 */
		const btndiv = document.createElement('div');
		btndiv.innerHTML = '<i class="icon-footer-toggle small-icon"></i>';
		this.btn.appendChild(btndiv);
		this.btn.setAttribute('tooltip-class', 'top');
		this.updateStyle();
		this.btn.onclick = this.toggle.bind(this);
		this.el.nativeElement.appendChild(this.btn);
	}

	toggle() {
		requestAnimationFrame(() => {
			this.minimize = !this.minimize;
			this.el.nativeElement.style.visibility = this.minimize ? 'hidden' : 'visible';
		})
	}
	private updateStyle() {
		this.btn.style.position = 'absolute';
		this.btn.style.bottom = 'calc(100% - 6px)';
		this.btn.style.left = '50%';
		this.btn.style.width = '60px';
		this.btn.style.color = 'white';
		this.btn.style.transform =  'translateX(-50%)';
		this.btn.style.border = 'none';
		this.btn.style.boxShadow = '2px 0 4px -2px black';
		this.btn.style.outline = 'none';
		this.btn.style.transition = '.5s';
		this.btn.style.zIndex = '1000';
		this.btn.style.visibility = 'visible';
		this.btn.style.background = '#0e0e0e';
	}
}

