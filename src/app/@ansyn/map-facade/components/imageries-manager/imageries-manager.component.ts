import { AfterContentChecked, Component, ElementRef, Inject, OnInit, ViewChild, Input } from '@angular/core';
import { MapEffects } from '../../effects/map.effects';
import { fromEvent, Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';
import {
	selectActiveMapId,
	selectFooterCollapse,
	selectLayout,
	selectMapsIds,
	selectMapsList,
	selectWasWelcomeNotificationShown
} from '../../reducers/map.reducer';
import {
	ActiveImageryMouseEnter,
	ClickOutsideMap,
	SetActiveMapId,
	UpdateMapSizeAction
} from '../../actions/map.actions';
import { DOCUMENT } from '@angular/common';
import { filter, map, tap } from 'rxjs/operators';
import { DragDropMapService } from './providers/drag-drop-map.service';

import { IMapsLayout, LayoutKey, layoutOptions } from '../../models/maps-layout';
import { IMapSettings } from '@ansyn/imagery';

// @dynamic
@Component({
	selector: 'ansyn-imageries-manager',
	templateUrl: './imageries-manager.component.html',
	styleUrls: ['./imageries-manager.component.less'],
	providers: [DragDropMapService]
})

export class ImageriesManagerComponent implements OnInit, AfterContentChecked {
	@Input() isLayersShow: boolean;
	@Input() isFootprintShow: boolean;
	public selectedLayout$: Observable<IMapsLayout> = this.store.pipe(
		select(selectLayout),
		map((layout: LayoutKey) => <IMapsLayout>layoutOptions.get(layout))
	);
	public activeMapId$: Observable<string> = this.store.select(selectActiveMapId);
	public mapsEntities$: Observable<IMapSettings[]> = this.store.select(selectMapsList);
	public ids$ = this.store.select(selectMapsIds);
	public footerCollapse$ = this.store.select(selectFooterCollapse);

	public showWelcomeNotification$ = this.store.pipe(
		select(selectWasWelcomeNotificationShown),
		map(bool => !bool)
	);

	public selectedLayout;

	@ViewChild('imageriesContainer', { static: true }) imageriesContainer: ElementRef;

	pinLocationMode: boolean;
	ids: string[] = [];
	mapsEntities: IMapSettings[] = [];
	activeMapId: string;
	footerCollapse: boolean;
	collapsable: boolean;

	constructor(
		protected mapEffects: MapEffects,
		protected readonly store: Store<any>,
		@Inject(DOCUMENT) protected document: Document,
		public dragDropMapService: DragDropMapService
	) {
	}

	ngOnInit() {
		this.initListeners();
		this.initSubscribers();
		this.initClickOutside();
	}

	ngAfterContentChecked(): void {
		this.collapsable = !!this.document.querySelector('div.status-timeline-container button.hide-menu');
	}

	initClickOutside() {
		fromEvent(this.document, 'click').pipe(
			filter((event: any) => !event.path.some(element => this.imageriesContainer.nativeElement === element)),
			filter((event: any) => !event.path.some((element) => element.id === 'geoPreSearch' || element.id === 'contextGeoFilter')),
			tap((event: MouseEvent) => this.store.dispatch(new ClickOutsideMap(event)))
		).subscribe();
	}

	initSubscribers() {
		this.selectedLayout$.subscribe(this.setSelectedLayout.bind(this));
		this.activeMapId$.subscribe(_activeMapId => this.activeMapId = _activeMapId);
		this.mapsEntities$.subscribe((mapsEntities) => this.mapsEntities = mapsEntities);
		this.ids$.subscribe((ids: string[]) => this.ids = ids);
		this.footerCollapse$.subscribe(collapse => this.footerCollapse = collapse);
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
		this.mapEffects.onForceMapsRender$.subscribe(() => {
			const entieis = [...this.mapsEntities];
			this.mapsEntities = [];
			setTimeout(() => this.mapsEntities = entieis, 0)
		})
	}

	changeActiveImagery(value) {
		if (this.activeMapId !== value) {
			this.store.dispatch(new SetActiveMapId(value));
			this.store.dispatch(new ActiveImageryMouseEnter());
		}
	}

	trackByFun(index, item) {
		if (!item) {
			return null;
		}
		return item.id;
	}
}
