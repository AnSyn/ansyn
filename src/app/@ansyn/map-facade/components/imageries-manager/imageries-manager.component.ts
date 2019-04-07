import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MapEffects } from '../../effects/map.effects';
import { fromEvent, Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';
import {
	IMapState,
	selectActiveMapId,
	selectLayout,
	selectMaps,
	selectMapsIds,
	selectWasWelcomeNotificationShown
} from '../../reducers/map.reducer';
import {
	ActiveImageryMouseEnter,
	ClickOutsideMap,
	SetActiveMapId,
	UpdateMapSizeAction
} from '../../actions/map.actions';
import { DOCUMENT } from '@angular/common';
import { ICaseMapState, IMapsLayout, LayoutKey, layoutOptions } from '@ansyn/imagery';
import { distinctUntilChanged, filter, map, pluck, tap } from 'rxjs/operators';
import { Dictionary } from '@ngrx/entity/src/models';
import { DragDropMapService } from './providers/drag-drop-map.service';

// @dynamic
@Component({
	selector: 'ansyn-imageries-manager',
	templateUrl: './imageries-manager.component.html',
	styleUrls: ['./imageries-manager.component.less'],
	providers: [DragDropMapService]
})

export class ImageriesManagerComponent implements OnInit {
	public selectedLayout$: Observable<IMapsLayout> = this.store.pipe(
		select(selectLayout),
		map((layout: LayoutKey) => <IMapsLayout> layoutOptions.get(layout))
	);
	public activeMapId$: Observable<string> = this.store.select(selectActiveMapId);
	public mapsEntities$: Observable<Dictionary<ICaseMapState>> = this.store.select(selectMaps);
	public ids$ = this.store.select(selectMapsIds);

	public showWelcomeNotification$ = this.store.pipe(
		select(selectWasWelcomeNotificationShown),
		map(bool => !bool)
	);

	public selectedLayout;

	clickTimeout: number;
	preventDbClick: boolean;


	@ViewChild('imageriesContainer') imageriesContainer: ElementRef;

	pinLocationMode: boolean;
	ids: string[] = [];
	mapsEntities: Dictionary<ICaseMapState>;
	activeMapId: string;

	constructor(protected mapEffects: MapEffects,
				protected store: Store<IMapState>,
				@Inject(DOCUMENT) protected document: Document,
				public dragDropMapService: DragDropMapService
	) {
	}

	ngOnInit() {
		this.initListeners();
		this.initSubscribers();
		this.initClickOutside();
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
		this.mapsEntities$.subscribe((mapsEntities) => this.mapsEntities = mapsEntities);
		this.ids$.subscribe((ids: string[]) => this.ids = ids);
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
			this.store.dispatch(new SetActiveMapId(value));
			this.store.dispatch(new ActiveImageryMouseEnter());
		}
	}

	dbclick() {
		window.clearTimeout(this.clickTimeout);
		this.preventDbClick = true;
	}

}
