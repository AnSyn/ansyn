import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
	@Input() shown: boolean;
	@Input() shownDisabled: boolean;

	@Output() shownChange = new EventEmitter();

}
