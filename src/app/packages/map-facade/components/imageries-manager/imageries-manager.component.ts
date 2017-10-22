import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CaseMapState, Overlay } from '@ansyn/core/models';
import { get as _get, isNil as _isNil } from 'lodash';
import { MapEffects } from '../../effects/map.effects';
import { ImageryCommunicatorService } from '@ansyn/imagery';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { IMapState } from '../../reducers/map.reducer';
import { MapsLayout } from '@ansyn/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/distinctUntilChanged';
import { SetMapsDataActionStore, UpdateMapSizeAction } from '../../actions/map.actions';

@Component({
	selector: 'ansyn-imageries-manager',
	templateUrl: './imageries-manager.component.html',
	styleUrls: ['./imageries-manager.component.less']
})

export class ImageriesManagerComponent implements OnInit {

	mapState$: Observable<IMapState> = this.store.select(mapStateSelector);

	public selected_layout$: Observable<MapsLayout> = this.mapState$
		.pluck<IMapState, MapsLayout>('layout')
		.filter(layout => !_isNil(layout))
		.distinctUntilChanged();

	public overlaysNotInCase$: Observable<Map<string, boolean>> = this.mapState$
		.pluck<IMapState, Map<string, boolean>>('overlaysNotInCase');

	public activeMapId$: Observable<string> = this.mapState$
		.pluck<IMapState, string>('activeMapId')
		.distinctUntilChanged();

	public mapsList$: Observable<CaseMapState[]> = this.mapState$
		.pluck<IMapState, CaseMapState[]>('mapsList')
		.distinctUntilChanged();

	public selected_layout;
	public pointerMoveUnsubscriber: any;
	public publisherMouseShadowMapId: string;
	public listenersMouseShadowMapsId: Array<string>;
	public shadowMouseProcess: boolean;

	clickTimeout: number;
	preventDbClick: boolean;
	overlaysNotInCase: Map<string, boolean>;

	public loadingOverlaysIds: Array<string> = [];
	public mapIdToGeoOptions: Map<string, boolean>;

	@ViewChild('imageriesContainer') imageriesContainer: ElementRef;

	pinLocationMode: boolean;
	pinPointMode: boolean;
	mapsList: CaseMapState[];
	activeMapId: string;

	constructor(private mapEffects: MapEffects, private communicatorProvider: ImageryCommunicatorService, private store: Store<IMapState>) {
		this.shadowMouseProcess = false;
		this.publisherMouseShadowMapId = null;
		this.listenersMouseShadowMapsId = [];
	}

	ngOnInit() {
		this.initListeners();
		this.initSubscribers();
	}

	initSubscribers() {
		this.mapState$.subscribe((_mapState) => {
			this.loadingOverlaysIds = _mapState.loadingOverlays;
			this.mapIdToGeoOptions = _mapState.mapIdToGeoOptions;
		});

		this.selected_layout$.subscribe(this.setSelectedLayout.bind(this));

		this.overlaysNotInCase$.subscribe(_overlaysNotInCase => {
			this.overlaysNotInCase = _overlaysNotInCase;
		});

		this.activeMapId$.subscribe(this.setActiveMapId.bind(this));

		this.mapsList$.subscribe((_mapsList: CaseMapState[]) => {
			this.mapsList = _mapsList;
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
		if (old_class) {
			this.imageriesContainer.nativeElement.classList.remove(old_class);
		}
		this.imageriesContainer.nativeElement.classList.add(new_class);
		this.store.dispatch(new UpdateMapSizeAction());
	}

	setSelectedLayout(_selected_layout: MapsLayout) {
		this.setClassImageriesContainer(_selected_layout.id, this.selected_layout && this.selected_layout.id);
		this.selected_layout = _selected_layout;
	}

	setActiveMapId(_activeMapId) {
		this.activeMapId = _activeMapId;
		if (this.publisherMouseShadowMapId && this.publisherMouseShadowMapId !== this.activeMapId) {
			this.changeShadowMouseTarget();
		}
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

		this.mapEffects.pinPointModeTriggerAction$.subscribe((_pinPointMode: boolean) => {
			this.pinPointMode = _pinPointMode;
		});

		this.mapEffects.pinLocationModeTriggerAction$.subscribe((_pinLocationMode: boolean) => {
			this.pinLocationMode = _pinLocationMode;
		});
	}

	clickMapContainer(value) {
		this.clickTimeout = window.setTimeout(() => {
			if (!this.preventDbClick) {
				this.changeActiveImagery(value);
			}
			this.preventDbClick = false;
		}, 200);
	}

	changeActiveImagery(value) {
		if (this.activeMapId !== value) {
			this.store.dispatch(new SetMapsDataActionStore({ activeMapId: value }));
		}
	}

	changeShadowMouseTarget() {
		if (this.publisherMouseShadowMapId) {
			this.stopPointerMoveProcess();
			this.startPointerMoveProcess();
		}
	}


	startPointerMoveProcess() {
		if (this.selected_layout.maps_count < 2) {
			return;
		}
		const communicators = this.communicatorProvider.communicators;

		this.mapsList.forEach((mapItem: CaseMapState) => {
			if (mapItem.id === this.activeMapId) {
				this.publisherMouseShadowMapId = mapItem.id;
				if (communicators[mapItem.id]) {
					communicators[mapItem.id].setMouseShadowListener(true);
				}
				// @TODO add take until instead of unsubscribe ?? or not todo
				this.pointerMoveUnsubscriber = communicators[mapItem.id].pointerMove.subscribe(latLon => {
					this.drawShadowMouse(latLon);
				});
			} else {
				if (communicators[mapItem.id]) {
					communicators[mapItem.id].startMouseShadowVectorLayer();
				}
				this.listenersMouseShadowMapsId.push(mapItem.id);
			}
		});
		this.shadowMouseProcess = true;
	}

	drawShadowMouse(latLon) {
		const communicators = this.communicatorProvider.communicators;
		this.listenersMouseShadowMapsId.forEach(id => {
			if (communicators[id]) {
				communicators[id].drawShadowMouse(latLon);
			}
		});
	}

	stopPointerMoveProcess() {
		const communicators = this.communicatorProvider.communicators;

		if (communicators[this.publisherMouseShadowMapId]) {
			communicators[this.publisherMouseShadowMapId].setMouseShadowListener(false);
		}
		if (this.pointerMoveUnsubscriber) {
			this.pointerMoveUnsubscriber.unsubscribe();
		}

		if (this.listenersMouseShadowMapsId.length > 0) {
			this.listenersMouseShadowMapsId.forEach(id => {
				if (communicators[id]) {
					communicators[id].stopMouseShadowVectorLayer();
				}
			});
			this.listenersMouseShadowMapsId = [];
		}

		this.publisherMouseShadowMapId = null;
		this.shadowMouseProcess = false;
	}

	dbclick() {
		window.clearTimeout(this.clickTimeout);
		this.preventDbClick = true;
	}

}
