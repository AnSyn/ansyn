import { Component, HostBinding, Input } from '@angular/core';

@Component({
	selector: 'ansyn-loader',
	templateUrl: './ansyn-loader.component.html',
	styleUrls: ['./ansyn-loader.component.less']
})
export class AnsynLoaderComponent {
	@Input()
	@HostBinding('class.show') show: boolean;

	@Input() loaderText = '';
}
