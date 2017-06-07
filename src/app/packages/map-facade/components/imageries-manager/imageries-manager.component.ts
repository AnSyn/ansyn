import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MapsLayout } from '@ansyn/status-bar';
import { range } from 'lodash';
import { MapEffects } from '../../effects/map.effects';

@Component({
	selector: 'ansyn-imageries-manager',
	templateUrl: './imageries-manager.component.html',
	styleUrls: ['./imageries-manager.component.less'],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class ImageriesManagerComponent {
	private _selected_layout;

	@Output() public setActiveImagery = new EventEmitter();
	
	@Input() maps: any;
	public maps_count_range = [];

	@Input()
	set selected_layout(value: MapsLayout){
		this._selected_layout = value;
		this.maps_count_range = range(this.selected_layout.maps_count);
	};

	get selected_layout(): MapsLayout {
		return this._selected_layout;
	}


	constructor(private mapEffects: MapEffects){
		this.mapEffects.onStopMapShadowMouse$.subscribe(res => {
			console.log('stop map shadow container');
		});

		this.mapEffects.onStartMapShadowMouse$.subscribe(res => {
			console.log('start map shadow container');
		});
	}
}
