import { selectIsMinimalistViewMode } from './../../reducers/map.reducer';
import { AfterContentChecked, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MapEffects } from '../../effects/map.effects';
import { selectIsExportingMaps } from '../../reducers/map.reducer';
import { Observable, fromEvent, EMPTY } from 'rxjs';
import { select, Store } from '@ngrx/store';
import {
	IMapState,
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
	UpdateMapSizeAction,
	ToggleFooter,
	SetMinimalistViewModeAction,
	ExportMapsToPngActionSuccess,
	ExportMapsToPngActionFailed
} from '../../actions/map.actions';
import { DOCUMENT } from '@angular/common';
import { filter, map, tap, withLatestFrom, mergeMap, catchError, debounceTime } from 'rxjs/operators';
import { DragDropMapService } from './providers/drag-drop-map.service';

import { IMapsLayout, LayoutKey, layoutOptions } from '../../models/maps-layout';
import { IMapSettings } from '@ansyn/imagery';
import domtoimage from 'dom-to-image';
import { saveAs } from 'file-saver';
import { fromPromise } from 'rxjs/internal-compatibility';

// @dynamic
@Component({
	selector: 'ansyn-imageries-manager',
	templateUrl: './imageries-manager.component.html',
	styleUrls: ['./imageries-manager.component.less'],
	providers: [DragDropMapService]
})

export class ImageriesManagerComponent implements OnInit, AfterContentChecked {
	public selectedLayout$: Observable<IMapsLayout> = this.store.pipe(
		select(selectLayout),
		map((layout: LayoutKey) => <IMapsLayout>layoutOptions.get(layout))
	);
	public isExporting = false;
	public activeMapId$: Observable<string> = this.store.select(selectActiveMapId);
	public mapsEntities$: Observable<IMapSettings[]> = this.store.select(selectMapsList);
	public ids$ = this.store.select(selectMapsIds);
	public footerCollapse$ = this.store.select(selectFooterCollapse);
	private export$ = this.store.select(selectIsExportingMaps).pipe(
		filter(isExporting => isExporting === true),
		withLatestFrom(this.store.select(selectIsMinimalistViewMode), this.store.select(selectFooterCollapse)),
		tap(([exporting, initialMinimal, initialFooterCollapsed]: [boolean, boolean, boolean]) => {
			this.switchToExportMode(true, initialFooterCollapsed, initialMinimal);
		}),
		debounceTime(500),
		mergeMap(([exporting, initialMinimal, initialFooterCollapsed]: [boolean, boolean, boolean]) => {
			return fromPromise(this.exportElement(this.imageriesContainer.nativeElement.parentElement, initialMinimal, initialFooterCollapsed));
		}),
		tap((value: { result: boolean, msg: string, initialMinimal: boolean, initialFooterCollapsed: boolean }) => {
			this.switchToExportMode(false, value.initialFooterCollapsed, value.initialMinimal);
			if (value.result) {
				this.store.dispatch(new ExportMapsToPngActionSuccess());
			} else {
				this.store.dispatch(new ExportMapsToPngActionFailed(value.msg));
			}
		}),
		catchError((error) => {
			this.store.dispatch(new ExportMapsToPngActionFailed(error));
			return EMPTY;
		})
	);

	public showWelcomeNotification$ = this.store.pipe(
		select(selectWasWelcomeNotificationShown),
		map(bool => !bool)
	);

	public selectedLayout;

	clickTimeout: number;
	preventDbClick: boolean;


	@ViewChild('imageriesContainer', {static: true}) imageriesContainer: ElementRef;
	@ViewChild('loader', { read: ElementRef, static: true } ) loader: ElementRef;

	pinLocationMode: boolean;
	ids: string[] = [];
	mapsEntities: IMapSettings[] = [];
	activeMapId: string;
	footerCollapse: boolean;
	collapsable: boolean;

	constructor(protected mapEffects: MapEffects,
				protected readonly store: Store<any>,
				@Inject(DOCUMENT) protected document: Document,
				public dragDropMapService: DragDropMapService) {
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
			filter((event: any) => !event.path.some((element) => element.id === 'editGeoFilter' || element.id === 'contextGeoFilter')),
			tap((event: MouseEvent) => this.store.dispatch(new ClickOutsideMap(event)))
		).subscribe();
	}

	initSubscribers() {
		this.selectedLayout$.subscribe(this.setSelectedLayout.bind(this));
		this.activeMapId$.subscribe(_activeMapId => this.activeMapId = _activeMapId);
		this.mapsEntities$.subscribe((mapsEntities) => this.mapsEntities = mapsEntities);
		this.ids$.subscribe((ids: string[]) => this.ids = ids);
		this.footerCollapse$.subscribe(collapse => this.footerCollapse = collapse);
		this.export$.subscribe();
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

	trackByFun(index, item) {
		if (!item) {
			return null;
		}
		return item.id;
	}

	private async exportElement(element: Element, initialMinimal: boolean, initialFooterCollapsed: boolean): Promise<{ result: boolean, msg: string, initialMinimal: boolean, initialFooterCollapsed: boolean }> {
		try {
			const blob: Blob = await domtoimage.toBlob(element,
				{
					filter: (node) => {
						return (node !== this.loader.nativeElement.id || (Boolean(node.ol_lm)));
					}
				});
			saveAs(blob, 'map.jpeg');
			return { result: true, msg: null, initialMinimal, initialFooterCollapsed };
		} catch (err) {
			return { result: true, msg: err, initialMinimal, initialFooterCollapsed };
		}
	}

	private switchToExportMode(exportMode: boolean, initialFooterCollapsed: boolean, initialMinimal: boolean) {
		if (!initialMinimal) {
			this.store.dispatch(new SetMinimalistViewModeAction(exportMode));
		}
	}
}
