import { Component, Input, HostBinding } from '@angular/core';

@Component({
	selector: 'ansyn-animated-ellipsis',
	templateUrl: './animated-ellipsis.component.html',
	styleUrls: ['./animated-ellipsis.component.less']
})
export class AnimatedEllipsisComponent {
	@Input() text: string;

	@Input()
	@HostBinding('class.rtl') rtl: boolean;
}
