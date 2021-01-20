import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SelectedModalEnum } from '../../reducers/layers-modal';

@Component({
	selector: 'ansyn-layer-menu',
	templateUrl: './layer-menu.component.html',
	styleUrls: ['./layer-menu.component.less']
})
export class LayerMenuComponent {
	@Input() disabledRemove: boolean;
	@Output() openModal = new EventEmitter<SelectedModalEnum>();

	get SelectedModalEnum() {
		return SelectedModalEnum;
	}

}
