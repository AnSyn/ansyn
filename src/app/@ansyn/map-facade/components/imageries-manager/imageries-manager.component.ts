import { AfterContentChecked, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MapEffects } from '../../effects/map.effects';
import { selectIsExportingMaps } from '../../reducers/map.reducer';
import { Observable, fromEvent, timer } from 'rxjs';
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
	ExportMapsToPngActionFailed } from '../../actions/map.actions';
import { DOCUMENT } from '@angular/common';
import { filter, map, tap, take } from 'rxjs/operators';
import { DragDropMapService } from './providers/drag-drop-map.service';

import { IMapsLayout, LayoutKey, layoutOptions } from '../../models/maps-layout';
import { IMapSettings } from '@ansyn/imagery';
import domtoimage from 'dom-to-image';
import { saveAs } from 'file-saver';

// @dynamic./providers/export-map.service
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
	private export$ = this.store.select(selectIsExportingMaps)
								.pipe(filter(val => val === true));

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
	mapsEntities: IMapSettings[] = [];
	activeMapId: string;
	footerCollapse: boolean;
	collapsable: boolean;

	constructor(protected mapEffects: MapEffects,
				protected readonly store: Store<any>,
				@Inject(DOCUMENT) protected document: Document,
				public dragDropMapService: DragDropMapService)
	{
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
		this.export$.subscribe(() => { this.onExportMapRequested(); });
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

	trackByFun(item) {
		if (!item) {
			return null;
		}
		return item.id;
	}

	private onExportMapRequested(): void {
		const currentMapState: IMapState = this.getState(this.store);
		const initialMinimal = currentMapState.minimalistViewMode;
		const initialFooterCollapsed = currentMapState.footerCollapse;

		this.switchToExportMode(true, initialFooterCollapsed, initialMinimal);

		const minimizetimer$ = timer(0).pipe(take(1))
		.subscribe(async () => {

		const exported: {result: boolean, msg: string} = await this.exportElement(this.imageriesContainer.nativeElement.parentElement);
		this.switchToExportMode(false, initialFooterCollapsed, initialMinimal);
		if (exported.result) {
			this.store.dispatch(new ExportMapsToPngActionSuccess());
		} else {
			this.store.dispatch(new ExportMapsToPngActionFailed(exported.msg));
		}
	});
	}

	private async exportElement(element: Element): Promise<{result: boolean, msg: string}> {
		try {
			const blob: Blob = await domtoimage.toBlob(element,
								{filter: (node) => {
									return (node.id !== 'loader'); }});
			saveAs(blob, 'map.jpeg');
			return {result: true, msg: null};
		}
		catch (err) {
			console.error(err);
			return {result: true, msg: err};
		}
	}

	private switchToExportMode(exportMode: boolean, initialFooterCollapsed: boolean, initialMinimal: boolean) {
		this.isExporting = exportMode;
		if (!initialFooterCollapsed) {
			this.store.dispatch(new ToggleFooter(exportMode));
		}

		if (!initialMinimal) {
			this.store.dispatch(new SetMinimalistViewModeAction(exportMode));
		}
	}

	private getState<T>(store: Store<T>): T {
		let state: T;
		store.pipe(take(1))
					.subscribe(s => state = s);
		return state;
	}
}
