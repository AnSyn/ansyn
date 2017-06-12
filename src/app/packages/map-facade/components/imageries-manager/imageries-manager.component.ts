import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MapsLayout } from '@ansyn/status-bar';
import { CaseMapState } from '@ansyn/menu-items/cases';
import { range,cloneDeep } from 'lodash';
import { MapEffects } from '../../effects/map.effects';
import { ImageryCommunicatorService, IMapPlugin } from '@ansyn/imagery';

@Component({
	selector: 'ansyn-imageries-manager',
	templateUrl: './imageries-manager.component.html',
	styleUrls: ['./imageries-manager.component.less'],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class ImageriesManagerComponent {
	private _selected_layout;
	private _activeMapId;
	private _maps:any;
	public maps_count_range = [];


	@Output() public setActiveImagery = new EventEmitter();
	
	@Input() 
	set maps(value: any){
		this._maps = cloneDeep(value);
		this._activeMapId = this._maps.active_map_id;
	};

	@Input()
	set selected_layout(value: MapsLayout){
		this._selected_layout = value;
		this.maps_count_range = range(this.selected_layout.maps_count);
		
	};

	get selected_layout(): MapsLayout {
		return this._selected_layout;
	}

	public pointerMoveUnsubscriber: any;
	public publisherMouseShadowMapId: string;
	public listenersMouseShadowMapsId: Array<string>;
	public shadowMouseProcess:boolean;

	constructor(private mapEffects: MapEffects,private communicatorProvider:ImageryCommunicatorService){
	 	this.shadowMouseProcess = false;
	 	this.publisherMouseShadowMapId = null;
		this.listenersMouseShadowMapsId = new Array<string>();

		this.mapEffects.onComposeMapShadowMouse$.subscribe(res => {
			this.changeShadowMouseTarget();
		});

		this.mapEffects.onStopMapShadowMouse$.subscribe(res => {
			this.stopPointerMoveProcess();
		});

		this.mapEffects.onStartMapShadowMouse$.subscribe(res => {
			this.startPointerMoveProcess();
		});
	}

	chagngeActiveImagery(value){
		this.setActiveImagery.emit(value);
		this._activeMapId = value;
		this.changeShadowMouseTarget();
	}

	changeShadowMouseTarget(){
		if(this.publisherMouseShadowMapId ){
			this.stopPointerMoveProcess();
			this.startPointerMoveProcess();
		}
	}

	startPointerMoveProcess(){
		if(this.maps_count_range.length < 2){
			return; 
		}
		const communicators = this.communicatorProvider.communicators;
		
		this._maps.data.forEach((mapItem: CaseMapState) => {
			if(mapItem.id === this._activeMapId ){
				this.publisherMouseShadowMapId = mapItem.id;
				communicators[mapItem.id].toggleMouseShadowListener();
				//@todo add take until instead of unsubscribe ?? or not todo  
				this.pointerMoveUnsubscriber = communicators[mapItem.id]['pointerMove'].subscribe( latLon => {
					this.drawShadowMouse(latLon);
				});		
			}else{
				communicators[mapItem.id] && communicators[mapItem.id].startMouseShadowVectorLayer();
				this.listenersMouseShadowMapsId.push(mapItem.id);
			}
		});
		this.shadowMouseProcess = true;
	}	

	drawShadowMouse(latLon){
		const communicators = this.communicatorProvider.communicators;
		this._maps.data.forEach((mapItem: CaseMapState) => {
			if(mapItem.id !== this._activeMapId ){
				communicators[mapItem.id].drawShadowMouse(latLon);
			}
		});	
	}
	
	stopPointerMoveProcess(){
		const communicators = this.communicatorProvider.communicators;
			
		communicators[this.publisherMouseShadowMapId].toggleMouseShadowListener();
		this.pointerMoveUnsubscriber.unsubscribe();		
		
		if(this.listenersMouseShadowMapsId.length > 0){
			this.listenersMouseShadowMapsId.forEach(id => {
				communicators[id] && communicators[id].stopMouseShadowVectorLayer();
			});
			this.listenersMouseShadowMapsId = new Array<string>();
		}	
		
		this.publisherMouseShadowMapId = null;
		this.shadowMouseProcess = false;
	}
}
