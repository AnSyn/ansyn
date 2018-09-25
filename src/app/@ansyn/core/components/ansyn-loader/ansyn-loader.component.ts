import { Component, HostBinding, Input } from '@angular/core';

@Component({
	selector: 'ansyn-loader',
	templateUrl: './ansyn-loader.component.html',
	styleUrls: ['./ansyn-loader.component.less']
})
export class AnsynLoaderComponent {
	@Input()
	@HostBinding('class.show')
	set show(value) {
		this._show = value;
	}
	get show() {
		return this._show;
	}
	_show = false;
	@Input() loaderText = '';
}
