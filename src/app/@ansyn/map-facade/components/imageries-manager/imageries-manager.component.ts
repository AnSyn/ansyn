import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MapEffects } from '../../effects/map.effects';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { IMapState, mapStateSelector } from '../../reducers/map.reducer';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/distinctUntilChanged';
import { SetMapsDataActionStore, UpdateMapSizeAction, ClickOutsideMap } from '../../actions/map.actions';
import { DOCUMENT } from '@angular/common';
import { coreStateSelector, ICoreState } from '@ansyn/core/reducers/core.reducer';
import { MapsLayout } from '@ansyn/core/models/maps-layout';
import { LayoutKey, layoutOptions } from '@ansyn/core/models/layout-options.model';
import { CaseMapState } from '@ansyn/core/models/case.model';
import { ActiveImageryMouseEnter } from '@ansyn/map-facade/actions/map.actions';

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
	mapsList: CaseMapState[];
	activeMapId: string;

	constructor(protected mapEffects: MapEffects, protected store: Store<IMapState>, @Inject(DOCUMENT) protected document: Document) {
	}

	ngOnInit() {
		this.initListeners();
		this.initSubscribers();
		this.initClickOutside();
	}

	initClickOutside() {
		Observable
			.fromEvent(this.document, 'click')
			.filter((event: any) => !event.path.some(element => this.imageriesContainer.nativeElement === element))
			.do((event: MouseEvent) => this.store.dispatch(new ClickOutsideMap(event)))
			.subscribe()
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
			this.store.dispatch(new ActiveImageryMouseEnter());
		}
	}

	dbclick() {
		window.clearTimeout(this.clickTimeout);
		this.preventDbClick = true;
	}

}
