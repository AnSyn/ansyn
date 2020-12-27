import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { SelectedModalEnum } from '../../reducers/layers-modal';

@Component({
	selector: 'ansyn-layer-menu',
	templateUrl: './layer-menu.component.html',
	styleUrls: ['./layer-menu.component.less']
})
export class LayerMenuComponent {
	@Input() disabledRemove: boolean;
	@Output() openModal = new EventEmitter<SelectedModalEnum>();

	@HostBinding('class.rtl')
	@Input() isRTL = false;

	get SelectedModalEnum() {
		return SelectedModalEnum;
	}

}
