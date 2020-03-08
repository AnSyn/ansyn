import { Component, ElementRef, HostBinding, Input } from '@angular/core';

@Component({
	selector: 'button[ansynComboBoxTrigger]',
	templateUrl: './combo-box-trigger.component.html',
	styleUrls: ['./combo-box-trigger.component.less']
})
export class ComboBoxTriggerComponent {
	@Input() icon: string;
	@HostBinding('class.active')
	@Input() isActive: boolean;
	@Input() withArrow = true;

	constructor(public optionsTrigger: ElementRef) {
	}
}
