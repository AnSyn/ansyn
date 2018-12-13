import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UUID } from 'angular2-uuid';

@Component({
	selector: 'ansyn-color-picker',
	templateUrl: './color-picker.component.html',
	styleUrls: ['./color-picker.component.less']
})
export class ColorPickerComponent {
	id = UUID.UUID();
	@Input() color: string;
	@Output() colorChange = new EventEmitter();
	@Input() label: string;
	@Input() active: boolean;
	@Input() activeDisabled: boolean;

	@Output() activeChange = new EventEmitter();

}
