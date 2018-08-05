import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';

@Component({
	selector: 'ansyn-combo-box-trigger',
	templateUrl: './combo-box-trigger.component.html',
	styleUrls: ['./combo-box-trigger.component.less']
})
export class ComboBoxTriggerComponent {
	@Input() icon: string;
	@Input() isActive: boolean;
	@Input() comboBoxToolTipDescription;
	@Input() render;
	@ViewChild('optionsTrigger') optionsTrigger: ElementRef;

	constructor(public elementRef: ElementRef) {
	}
}
