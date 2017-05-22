import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
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
	private _maps_data;
	private active_map_id;

	@Input()
	set selected_layout(value: MapsLayout) {
		this._selected_layout = value;
	}

	@Input()
	set maps_data(value) {
		this._maps_data = value;
	};

	get maps_data() {
		return this._maps_data;
	};

	get selected_layout(): MapsLayout {
		return this._selected_layout;
	}

	setActiveImagery(id: string) {
		console.log("id = ", id)
		this.active_map_id = id;
	}

}
