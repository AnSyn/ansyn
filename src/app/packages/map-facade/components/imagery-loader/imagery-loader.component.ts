import { Component, HostBinding, Input } from '@angular/core';

@Component({
	selector: 'ansyn-imagery-loader',
	templateUrl: './imagery-loader.component.html',
	styleUrls: ['./imagery-loader.component.less']
})
export class ImageryLoaderComponent {
	@HostBinding('class.show') @Input() show: string;
}
