import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';

@Component({
	selector: 'ansyn-slider-checkbox',
	templateUrl: './slider-checkbox.component.html',
	styleUrls: ['./slider-checkbox.component.less']
})
export class SliderCheckboxComponent {
	@Input() readonly checked: boolean;
	@Input() readonly disabled: boolean;
	@Output() readonly checkedChange = new EventEmitter<Event>();
	@HostBinding('class.rtl')
	@Input() isRTL = true;
}
