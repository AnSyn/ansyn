import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UUID } from 'angular2-uuid';

@Component({
	selector: 'ansyn-checkbox',
	templateUrl: './ansyn-checkbox.component.html',
	styleUrls: ['./ansyn-checkbox.component.less']
})

export class AnsynCheckboxComponent {
	@Input() id = UUID.UUID();
	@Input() readonly checked: boolean;
	@Input() readonly disabled: boolean;
	@Output() readonly checkedChange = new EventEmitter<boolean>();
}
