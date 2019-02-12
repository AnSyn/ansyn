import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MapEffects } from '../../effects/map.effects';
import { fromEvent, Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { IMapState, selectActiveMapId, selectMaps, selectMapsIds } from '../../reducers/map.reducer';
import {
	ActiveImageryMouseEnter,
	ClickOutsideMap,
	SetActiveMapId, SetMapsDataActionStore,
	UpdateMapSizeAction
} from '../../actions/map.actions';
import { DOCUMENT } from '@angular/common';
import {
	coreStateSelector,
	ICaseMapState,
	ICoreState,
	IMapsLayout,
	LayoutKey,
	layoutOptions,
	selectLayout
} from '@ansyn/core';
import { distinctUntilChanged, filter, map, pluck, tap } from 'rxjs/operators';
import { Dictionary } from '@ngrx/entity/src/models';

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
	public mapsEntities$: Observable<Dictionary<ICaseMapState>> = this.store.select(selectMaps);
	public ids$ = this.store.select(selectMapsIds);
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
	ids: string[] = [];
	mapsEntities: Dictionary<ICaseMapState>;
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
		}, 1000);
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

	startMove($event, dragElement) {
		document.body.style.userSelect = 'none';
		const TRANSITION_DURATION = 200;
		dragElement.classList.add('draggable');
		const { x: initialX, y: initialY } = dragElement.getBoundingClientRect();
		const { currentTarget } = $event;
		const { width: targetWidth, height: targetHeight } = currentTarget.getBoundingClientRect();
		let dropElement;

		const mouseMove = ($event) => {
			dragElement.style.pointerEvents = 'none';
			const { x, y, width, height }  = dragElement.getBoundingClientRect();
			const pointElem = document.elementFromPoint(x + (width / 2), y + (height / 2));
			const newDropElement = pointElem && pointElem.closest('.map-container-wrapper');
			if (dropElement) {
				dropElement.style.filter = null;
				dropElement.querySelector('.active-border').style.height = null;
			}
			dropElement = newDropElement;
			if (dropElement) {
				dropElement.style.filter = 'blur(2px)';
				dropElement.querySelector('.active-border').style.height = '100%';
			}
			const left = targetWidth / 2;
			const top = targetHeight / 2;
			dragElement.style.transition = null;
			dragElement.style.zIndex = 200;
			dragElement.style.transform = `translate(${$event.clientX - initialX - left}px, ${$event.clientY - initialY - top}px)`;
		};

		const mouseUp = () => {
			document.body.style.userSelect = null;
			dragElement.style.transition = `${TRANSITION_DURATION}ms`;
			let mapsList = null;

			if (dropElement) {
				const dropBoundingRect = dropElement.getBoundingClientRect();
				dropElement.style.transition = `${TRANSITION_DURATION}ms`;
				dropElement.style.transform = `translate(${initialX - dropBoundingRect.x}px, ${initialY - dropBoundingRect.y}px)`;
				dragElement.style.transform = `translate(${dropBoundingRect.x - initialX}px, ${dropBoundingRect.y - initialY}px)`;
				dropElement.style.zIndex = 199;
				const ids = [...this.ids];
				const id1 = dragElement.id;
				const id2 = dropElement.id;
				const indexOf1 = ids.indexOf(id1);
				const indexOf2 = ids.indexOf(id2);
				ids[indexOf1] = id2;
				ids[indexOf2] = id1;
				mapsList = ids.map((id) => this.mapsEntities[id]);
				dropElement.classList.remove('droppable');
			} else {
				dragElement.style.transform = `translate(0, 0)`;
			}
			setTimeout(() => {
				dragElement.classList.remove('draggable');
				dragElement.style.pointerEvents = null;
				dragElement.style.transition = null;
				dragElement.style.transform = null;
				dragElement.style.zIndex = null;
				if (dropElement) {
					dropElement.style.transition = null;
					dropElement.style.transform = null;
					dropElement.style.zIndex = null;
					dropElement.querySelector('.active-border').style.height = null;
				}
				if (mapsList) {
					this.store.dispatch(new SetMapsDataActionStore({ mapsList }));
				}
			}, TRANSITION_DURATION);

			document.removeEventListener('mousemove', mouseMove);
			document.removeEventListener('mouseup', mouseUp);
		};

		document.addEventListener('mousemove', mouseMove);
		document.addEventListener('mouseup', mouseUp);
	}

	dbclick() {
		window.clearTimeout(this.clickTimeout);
		this.preventDbClick = true;
	}

}
