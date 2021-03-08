import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SelectedModalEnum } from '../../reducers/layers-modal';

@Component({
	selector: 'ansyn-layer-menu',
	templateUrl: './layer-menu.component.html',
	styleUrls: ['./layer-menu.component.less']
})
export class LayerMenuComponent {
	@Input() disabledRemove: boolean;
	@Input() selected: boolean;
	@Output() menuClick = new EventEmitter<string>();
	@Input() removeActive = false;
	@Input() exportActive = false;
	@Input() toggleActive = false;
	@Input() editActive = false;

	get SelectedModalEnum() {
		return SelectedModalEnum;
	}

}
