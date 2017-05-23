import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { range } from 'lodash';
import { MapsLayout } from '@ansyn/status-bar';

@Component({
	selector: 'ansyn-imageries-manager',
	templateUrl: './imageries-manager.component.html',
	styleUrls: ['./imageries-manager.component.less'],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class ImageriesManagerComponent {
	public MAPS_COUNT = range(4);
	private _selected_layout;
	private _maps;

	@Output() public setActiveImagery = new EventEmitter();

	@Input()
	set selected_layout(value: MapsLayout) {
		this._selected_layout = value;
	}

	@Input()
	set maps(value) {
		this._maps = value;
	};

	get maps() {
		return this._maps;
	};

	get selected_layout(): MapsLayout {
		return this._selected_layout;
	}

}
