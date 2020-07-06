import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
	selector: 'ansyn-popover',
	templateUrl: './ansyn-popover.component.html',
	styleUrls: ['./ansyn-popover.component.less']
})
export class AnsynPopoverComponent {

	@Input() readonly icon: string;

	@Input() showOverflow: boolean;

	@Input()
	readonly text: string;

	@Input() popDirection = 'top wrap';

	@Output()
	readonly clickChange = new EventEmitter<Event>();
}
