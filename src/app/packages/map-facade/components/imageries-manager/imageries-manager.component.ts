import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CaseMapState } from '@ansyn/core/models';
import { range as _range, isNil as _isNil} from 'lodash';
import { MapEffects } from '../../effects/map.effects';
import { ImageryCommunicatorService } from '@ansyn/imagery';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { IMapState } from '../../reducers/map.reducer';
import { CaseMapsState, MapsLayout } from '@ansyn/core';
import "rxjs/add/operator/map";
import "rxjs/add/operator/distinctUntilChanged";
import { ActiveMapChangedAction, UpdateMapSizeAction } from '../../actions/map.actions';
import { Overlay } from '@ansyn/core/models';
import { get as _get } from 'lodash';

@Component({
	selector: 'ansyn-imageries-manager',
	templateUrl: './imageries-manager.component.html',
	styleUrls: ['./imageries-manager.component.less']
})

export class ImageriesManagerComponent implements OnInit{

	public mapState$: Observable<IMapState> = this.store.select('map');

	public selected_layout$: Observable<MapsLayout> = this.mapState$
		.pluck<IMapState,MapsLayout>('layout')
		.filter(layout => !_isNil(layout))
		.distinctUntilChanged();

	public overlaysNotInCase$: Observable<Map<string, boolean>> = this.mapState$
		.pluck<IMapState,Map<string, boolean>>('overlaysNotInCase')
		.distinctUntilChanged();

	public selected_layout;
	private _maps: CaseMapsState;
	public pointerMoveUnsubscriber: any;
	public publisherMouseShadowMapId: string;
	public listenersMouseShadowMapsId: Array<string>;
	public shadowMouseProcess:boolean;

	clickTimeout: number;
	preventDbClick: boolean;
	overlaysNotInCase: Map<string, boolean>;


	public loadingOverlaysIds = [];
	public mapIdToGeoOptions: Map<string, boolean>;

	@ViewChild('imageriesContainer') imageriesContainer: ElementRef;

	@Input() pinLocation: boolean;

	@Input()
	set maps(value: any){
		if(!value) {
			return;
		}
		this._maps = value;
		if(this.publisherMouseShadowMapId && this.publisherMouseShadowMapId !== this.maps.active_map_id){
			this.changeShadowMouseTarget();
		}
	};

	get maps (){
		return this._maps;
	}
	get range(){
		return _range;
	}

	constructor(private mapEffects: MapEffects,private communicatorProvider:ImageryCommunicatorService, private store: Store<IMapState>){
		this.shadowMouseProcess = false;
		this.publisherMouseShadowMapId = null;
		this.listenersMouseShadowMapsId = new Array<string>();
	}

	ngOnInit(){
		this.initListeners();

		this.mapState$.subscribe((_mapState) => {
			this.loadingOverlaysIds = _mapState.loadingOverlays;
			this.mapIdToGeoOptions = _mapState.mapIdToGeoOptions;
		});

		this.selected_layout$.subscribe(this.setSelectedLayout.bind(this))

		this.overlaysNotInCase$.subscribe(_overlaysNotInCase => {
			this.overlaysNotInCase = _overlaysNotInCase
		});
	}

	isGeoOptionsDisabled(mapId: string): boolean {
		return this.mapIdToGeoOptions && this.mapIdToGeoOptions.has(mapId) && !this.mapIdToGeoOptions.get(mapId);
	}

	overlayNotInCase(overlay: Overlay) {
		const overlayId = <string> _get(overlay, 'id');
		return this.overlaysNotInCase.has(overlayId) ? this.overlaysNotInCase.get(overlayId) : false;
	}

	isOverlayLoading(overlayId) {
		const existIndex = this.loadingOverlaysIds.findIndex((_overlayId) => overlayId === _overlayId);
		return existIndex !== -1;
	}

	setClassImageriesContainer(new_class, old_class?) {
		if(old_class){
			this.imageriesContainer.nativeElement.classList.remove(old_class);
		}
		this.imageriesContainer.nativeElement.classList.add(new_class);
		this.store.dispatch(new UpdateMapSizeAction());
	}

	setSelectedLayout(_selected_layout: MapsLayout) {
		this.setClassImageriesContainer(_selected_layout.id, this.selected_layout && this.selected_layout.id);
		this.selected_layout = _selected_layout;
	}

	initListeners() {
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

	clickMapContainer(value){
		this.clickTimeout = window.setTimeout(() => {
			if (!this.preventDbClick){
				this.changeActiveImagery(value);
			}
			this.preventDbClick = false;
		}, 200);
	}

	changeActiveImagery(value) {
		if(this.maps.active_map_id !== value){
			this.store.dispatch(new ActiveMapChangedAction(value));
		}
	}

	changeShadowMouseTarget(){
		if(this.publisherMouseShadowMapId ){
			this.stopPointerMoveProcess();
			this.startPointerMoveProcess();
		}
	}

	startPointerMoveProcess(){
		if(this.maps.data.length < 2){
			return;
		}
		const communicators = this.communicatorProvider.communicators;

		this._maps.data.forEach((mapItem: CaseMapState) => {
			if(mapItem.id === this._maps.active_map_id ){
				this.publisherMouseShadowMapId = mapItem.id;
				if (communicators[mapItem.id]) {
					communicators[mapItem.id].setMouseShadowListener(true);
				}
				//@todo add take until instead of unsubscribe ?? or not todo
				this.pointerMoveUnsubscriber = communicators[mapItem.id]['pointerMove'].subscribe( latLon => {
					this.drawShadowMouse(latLon);
				});
			}else{
				if (communicators[mapItem.id]) {
					communicators[mapItem.id].startMouseShadowVectorLayer();
				}
				this.listenersMouseShadowMapsId.push(mapItem.id);
			}
		});
		this.shadowMouseProcess = true;
	}

	drawShadowMouse(latLon){
		const communicators = this.communicatorProvider.communicators;
		this.listenersMouseShadowMapsId.forEach(id => {
			if(communicators[id]) {
				communicators[id].drawShadowMouse(latLon);
			}
		});
	}

	stopPointerMoveProcess(){
		const communicators = this.communicatorProvider.communicators;

		if (communicators[this.publisherMouseShadowMapId]) {
			communicators[this.publisherMouseShadowMapId].setMouseShadowListener(false);
		}
		if(this.pointerMoveUnsubscriber) {
			this.pointerMoveUnsubscriber.unsubscribe();
		}

		if(this.listenersMouseShadowMapsId.length > 0){
			this.listenersMouseShadowMapsId.forEach(id => {
				if (communicators[id]){
					communicators[id].stopMouseShadowVectorLayer();
				}
			});
			this.listenersMouseShadowMapsId = new Array<string>();
		}

		this.publisherMouseShadowMapId = null;
		this.shadowMouseProcess = false;
	}

	dbclick() {
		window.clearTimeout(this.clickTimeout);
		this.preventDbClick = true;
	}

}
