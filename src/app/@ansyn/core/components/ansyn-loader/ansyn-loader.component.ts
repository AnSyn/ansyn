import { Component, HostBinding, Input } from '@angular/core';

@Component({
	selector: 'ansyn-loader',
	templateUrl: './ansyn-loader.component.html',
	styleUrls: ['./ansyn-loader.component.less']
})
export class AnsynLoaderComponent {
	@Input() show = false;
	@Input() loaderText = '';

	@HostBinding('class.show')
	get ShowIt() {
		return this.show;
	}
}
