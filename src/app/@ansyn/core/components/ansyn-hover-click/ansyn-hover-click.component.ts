import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
	selector: 'ansyn-hover-click',
	templateUrl: './ansyn-hover-click.component.html',
	styleUrls: ['./ansyn-hover-click.component.less']
})
export class AnsynHoverClickComponent {

	@Input() readonly icon: string;

	@Input()
	readonly text: string;

	@Input() popDirection = 'top wrap';

	@Output()
	readonly clickChange = new EventEmitter<Event>();
}
