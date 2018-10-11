import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MapEffects } from '../../effects/map.effects';
import { fromEvent, Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { IMapState, mapStateSelector, selectActiveMapId, selectMapsList } from '../../reducers/map.reducer';
import { ActiveImageryMouseEnter, ClickOutsideMap, UpdateMapSizeAction } from '../../actions/map.actions';
import { DOCUMENT } from '@angular/common';
import {
	coreStateSelector,
	ICaseMapState,
	ICoreState,
	IMapsLayout,
	LayoutKey,
	layoutOptions, selectLayout,
	SetMapsDataActionStore
} from '@ansyn/core';
import { filter, map, pluck, tap, distinctUntilChanged } from 'rxjs/operators';

// @dynamic
@Component({
	selector: 'ansyn-imageries-manager',
	templateUrl: './imageries-manager.component.html',
	styleUrls: ['./imageries-manager.component.less']
})

export class ImageriesManagerComponent implements OnInit {
	public selectedLayout$: Observable<IMapsLayout> = this.store.pipe(
		select(selectLayout),
		map((layout: LayoutKey) => <IMapsLayout> layoutOptions.get(layout))
	);
	public activeMapId$: Observable<string> = this.store.select(selectActiveMapId);
	public mapsList$: Observable<ICaseMapState[]> = this.store.select(selectMapsList);
	public renderContextMenu: boolean;

	public showWelcomeNotification$ = this.store.pipe(
		select(coreStateSelector),
		pluck<ICoreState, boolean>('wasWelcomeNotificationShown'),
		distinctUntilChanged(),
		map(bool => !bool)
	);

	public selectedLayout;

	clickTimeout: number;
	preventDbClick: boolean;


	@ViewChild('imageriesContainer') imageriesContainer: ElementRef;

	pinLocationMode: boolean;
	mapsList: ICaseMapState[];
	activeMapId: string;

	constructor(protected mapEffects: MapEffects, protected store: Store<IMapState>, @Inject(DOCUMENT) protected document: Document) {
	}

	ngOnInit() {
		this.initListeners();
		this.initSubscribers();
		this.initClickOutside();
		this.initRenderContextMenu();
	}

	initRenderContextMenu() {
		setTimeout(() => {
			this.renderContextMenu = true;
		}, 1000)
	}

	initClickOutside() {
		fromEvent(this.document, 'click').pipe(
			filter((event: any) => !event.path.some(element => this.imageriesContainer.nativeElement === element)),
			filter((event: any) => !event.path.some((element) => element.id === 'editGeoFilter' || element.id === 'contextGeoFilter')),
			tap((event: MouseEvent) => this.store.dispatch(new ClickOutsideMap(event)))
		).subscribe();
	}

	initSubscribers() {
		this.selectedLayout$.subscribe(this.setSelectedLayout.bind(this));
		this.activeMapId$.subscribe(_activeMapId => this.activeMapId = _activeMapId);
		this.mapsList$.subscribe((_mapsList: ICaseMapState[]) => this.mapsList = _mapsList);
	}


	setClassImageriesContainer(newClass, oldClass?) {
		if (oldClass) {
			this.imageriesContainer.nativeElement.classList.remove(oldClass);
		}
		this.imageriesContainer.nativeElement.classList.add(newClass);
		this.store.dispatch(new UpdateMapSizeAction());
	}

	setSelectedLayout(_selectedLayout: IMapsLayout) {
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
