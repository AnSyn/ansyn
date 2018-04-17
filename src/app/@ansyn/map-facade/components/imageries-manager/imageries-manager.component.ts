import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CaseMapState } from '@ansyn/core/models';
import { MapEffects } from '../../effects/map.effects';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { coreStateSelector, ICoreState, LayoutKey, layoutOptions, MapsLayout } from '@ansyn/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/distinctUntilChanged';
import { SetMapsDataActionStore, UpdateMapSizeAction } from '../../actions/map.actions';
import { IMapState, mapStateSelector } from '@ansyn/map-facade/reducers/interfaces';

@Component({
	selector: 'ansyn-imageries-manager',
	templateUrl: './imageries-manager.component.html',
	styleUrls: ['./imageries-manager.component.less']
})

export class ImageriesManagerComponent implements OnInit {
	public core$: Observable<ICoreState> = this.store.select(coreStateSelector);
	public mapState$: Observable<IMapState> = this.store.select(mapStateSelector);

	public selectedLayout$: Observable<MapsLayout> = this.core$
		.pluck<ICoreState, LayoutKey>('layout')
		.distinctUntilChanged()
		.map((layout: LayoutKey) => <MapsLayout> layoutOptions.get(layout));

	public activeMapId$: Observable<string> = this.mapState$
		.pluck<IMapState, string>('activeMapId')
		.distinctUntilChanged();

	public mapsList$: Observable<CaseMapState[]> = this.mapState$
		.pluck<IMapState, CaseMapState[]>('mapsList')
		.distinctUntilChanged();

	public showWelcomeNotification$ = this.store.select(coreStateSelector)
		.pluck<ICoreState, boolean>('wasWelcomeNotificationShown')
		.distinctUntilChanged()
		.map(bool => !bool)
	;

	public selectedLayout;

	clickTimeout: number;
	preventDbClick: boolean;


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
		this.selectedLayout$.subscribe(this.setSelectedLayout.bind(this));
		this.activeMapId$.subscribe(_activeMapId => this.activeMapId = _activeMapId);
		this.mapsList$.subscribe((_mapsList: CaseMapState[]) => this.mapsList = _mapsList);
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
