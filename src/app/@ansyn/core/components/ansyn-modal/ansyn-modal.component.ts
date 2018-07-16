import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';

@Component({
	selector: 'ansyn-modal',
	templateUrl: './ansyn-modal.component.html',
	styleUrls: ['./ansyn-modal.component.less']
})
export class AnsynModalComponent {
	@Input() @HostBinding('class.show') show: boolean;
	@Output() showChange = new EventEmitter<boolean>();
}
