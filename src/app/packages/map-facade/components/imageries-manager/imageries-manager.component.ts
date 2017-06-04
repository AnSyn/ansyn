import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MapsLayout } from '@ansyn/status-bar';
import { range } from 'lodash';

@Component({
	selector: 'ansyn-imageries-manager',
	templateUrl: './imageries-manager.component.html',
	styleUrls: ['./imageries-manager.component.less'],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class ImageriesManagerComponent {
	private _selected_layout;

	@Output() public setActiveImagery = new EventEmitter();
	@Input()
	set selected_layout(value: MapsLayout){
		this._selected_layout = value;
		this.maps_count_range = range(this.selected_layout.maps_count);
	};
	get selected_layout() {
		return this._selected_layout;
	}
	@Input() maps: any;
	maps_count_range = [];
}
