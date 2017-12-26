import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CaseMapState, Overlay } from '@ansyn/core/models';
import { get as _get, isNil as _isNil } from 'lodash';
import { MapEffects } from '../../effects/map.effects';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { IMapState, mapStateSelector } from '../../reducers/map.reducer';
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

	public selectedLayout$: Observable<MapsLayout> = this.mapState$
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

	public selectedLayout;

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

	constructor(protected mapEffects: MapEffects, protected store: Store<IMapState>) {
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

		this.selectedLayout$.subscribe(this.setSelectedLayout.bind(this));

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

	setClassImageriesContainer(newClass, oldClass?) {
		if (oldClass) {
			this.imageriesContainer.nativeElement.classList.remove(oldClass);
		}
		this.imageriesContainer.nativeElement.classList.add(newClass);
		this.store.dispatch(new UpdateMapSizeAction());
	}

	setSelectedLayout(_selectedLayout: MapsLayout) {
		this.setClassImageriesContainer(_selectedLayout.id, this.selectedLayout && this.selectedLayout.id);
		this.selectedLayout = _selectedLayout;
	}

	setActiveMapId(_activeMapId) {
		this.activeMapId = _activeMapId;
	}

	initListeners() {
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

	dbclick() {
		window.clearTimeout(this.clickTimeout);
		this.preventDbClick = true;
	}

}
