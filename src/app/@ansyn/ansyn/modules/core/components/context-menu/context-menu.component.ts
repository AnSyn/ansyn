import { Component, ElementRef, HostBinding, HostListener, Inject, OnInit, Renderer2 } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import {
	IMapState,
	mapStateSelector,
	ContextMenuDisplayAction,
	ContextMenuShowAction,
	ContextMenuTriggerAction,
	MapFacadeService,
	MapActionTypes,
	mapFacadeConfig,
	IMapFacadeConfig
} from '@ansyn/map-facade';
import { uniq as _uniq } from 'lodash';
import { Point } from 'geojson';
import { Actions, ofType } from '@ngrx/effects';
import { distinctUntilChanged, filter, map, tap, withLatestFrom } from 'rxjs/operators';
import { ContextMenuShowAngleFilter, IAngleFilterClick } from '@ansyn/map-facade';
import { selectRegion } from '../../../overlays/reducers/overlays.reducer';
import { IOverlay } from '../../../overlays/models/overlay.model';
import { CaseGeoFilter, ICaseMapState } from '../../../menu-items/cases/models/case.model';

export interface IContextMenuShowPayload {
	point: Point;
	overlays: IOverlay[];
	event: MouseEvent;
}

export interface IOverlayButton {
	name: string;
	subList: string;
	action: ($event: MouseEvent, subFilter?: string) => void;
}

@Component({
	selector: 'ansyn-context-menu',
	templateUrl: './context-menu.component.html',
	styleUrls: ['./context-menu.component.less']
})
export class ContextMenuComponent implements OnInit {
	mapState$ = this.store.select(mapStateSelector);

	get filterField() {
		return this.config.contextMenu.filterField;
	}

	displayedOverlay$: Observable<IOverlay> = this.mapState$.pipe(
		map(MapFacadeService.activeMap),
		filter(Boolean),
		map((activeMap: ICaseMapState) => activeMap.data.overlay),
		distinctUntilChanged()
	);

	geoFilter$: Observable<CaseGeoFilter> = this.store.select(selectRegion).pipe(
		filter(Boolean),
		tap((region) => this.geoFilter = region.type)
	);

	geoFilter;
	currentOverlay: IOverlay;

	nextSensors = [];
	prevSensors = [];
	allSensors = [];
	angleFilter: IAngleFilterClick = {
		click: {x: 0, y: 0},
		angles: [],
		displayedOverlay: undefined,
		point: null
	};
	point: Point;

	private _filteredOverlays: IOverlay[];
	private _prevfilteredOverlays = [];
	private _nextfilteredOverlays = [];

	set filteredOverlays(value) {
		this._filteredOverlays = value;
		this.allSensors = this.pluckFilterField(value);
	}

	set prevfilteredOverlays(value) {
		this._prevfilteredOverlays = value;
		this.prevSensors = this.pluckFilterField(value);
	}

	set nextfilteredOverlays(value) {
		this._nextfilteredOverlays = value;
		this.nextSensors = this.pluckFilterField(value);
	}

	get filteredOverlays() {
		return this._filteredOverlays;
	}

	get prevfilteredOverlays() {
		return this._prevfilteredOverlays;
	}

	get nextfilteredOverlays() {
		return this._nextfilteredOverlays;
	}


	overlayButtons: IOverlayButton[] = [
		{
			name: 'last',
			subList: 'nextSensors',
			action: this.clickLast.bind(this)
		},
		{
			name: 'first',
			subList: 'prevSensors',
			action: this.clickFirst.bind(this)
		},
		{
			name: 'next',
			subList: 'nextSensors',
			action: this.clickNext.bind(this)
		},
		{
			name: 'prev',
			subList: 'prevSensors',
			action: this.clickPrev.bind(this)
		},
		{
			name: 'best',
			subList: 'allSensors',
			action: this.clickBest.bind(this)
		},
		{
			name: 'angle',
			subList: 'angleFilter',
			action: this.clickAngle.bind(this)
		}
	];

	@HostBinding('attr.tabindex')
	get tabindex() {
		return 0;
	}

	@HostListener('window:mousewheel')
	get onMousewheel() {
		return this.hide;
	}

	@HostListener('contextmenu', ['$event'])
	onContextMenu($event) {
		$event.preventDefault();
	}

	constructor(protected store: Store<IMapState>,
				protected actions$: Actions,
				protected elem: ElementRef,
				protected renderer: Renderer2,
				public store$: Store<any>,
				@Inject(mapFacadeConfig) public config: IMapFacadeConfig) {
	}

	pluckFilterField(overlays: IOverlay[]) {
		return _uniq(overlays.map((overlay: IOverlay) => overlay[this.filterField]));
	}

	ngOnInit(): void {
		this.actions$.pipe(
			ofType(MapActionTypes.CONTEXT_MENU.SHOW),
			tap(this.show.bind(this)),
			withLatestFrom(this.displayedOverlay$),
			tap(this.setFilteredOverlays.bind(this)),
			tap(this.setAngleFilter.bind(this))
		).subscribe();
		this.geoFilter$.subscribe();
	}

	setFilteredOverlays([action, displayedOverlay]: [ContextMenuShowAction, IOverlay]) {
		const displayedOverlayId = (displayedOverlay && displayedOverlay.id);
		const filteredOverlays = action.payload.overlays.filter(({ id }) => id !== displayedOverlayId);
		this.initializeSensors(filteredOverlays, displayedOverlay);
		this.filteredOverlays = filteredOverlays;
		this.currentOverlay = displayedOverlay;
	}

	setAngleFilter([action, displayedOverlay]: [ContextMenuShowAction, IOverlay]) {
		this.angleFilter.click.x = action.payload.event.x;
		this.angleFilter.click.y = action.payload.event.y;
		this.angleFilter.angles = action.payload.overlays;
		this.angleFilter.point = action.payload.point;
		this.angleFilter.displayedOverlay = displayedOverlay;
	}

	show(action: ContextMenuShowAction) {
		this.point = action.payload.point;
		this.renderer.setStyle(this.elem.nativeElement, 'top', `${action.payload.event.y}px`);
		this.renderer.setStyle(this.elem.nativeElement, 'left', `${action.payload.event.x}px`);
		this.elem.nativeElement.focus();
	}

	initializeSensors(filteredOverlays, displayedOverlay?) {
		if (!displayedOverlay) {
			this.prevfilteredOverlays = [...filteredOverlays];
			this.nextfilteredOverlays = [...filteredOverlays];
		} else {
			const displayedOverlayDate = displayedOverlay.date;
			this.prevfilteredOverlays = filteredOverlays
				.filter((overlay: IOverlay) => overlay.date < displayedOverlayDate)
				.reverse();

			this.nextfilteredOverlays = filteredOverlays
				.filter((overlay: IOverlay) => displayedOverlayDate < overlay.date);
		}
	}

	hide() {
		this.elem.nativeElement.blur();
	}

	isClick($event: MouseEvent): boolean {
		return $event.which === 1;
	}

	clickNext($event: MouseEvent, subFilter?: string) {
		const nextOverlay = this.nextfilteredOverlays
			.find((overlay: IOverlay) => !subFilter || subFilter === overlay[this.filterField]);
		this.displayOverlayEvent($event, nextOverlay);
	}

	clickPrev($event: MouseEvent, subFilter?: string) {
		const prevOverlay = this.prevfilteredOverlays
			.find((overlay: IOverlay) => !subFilter || subFilter === overlay[this.filterField]);
		this.displayOverlayEvent($event, prevOverlay);
	}

	clickBest($event: MouseEvent, subFilter?: string) {
		const bestOverlay = this.filteredOverlays
			.filter((overlay: IOverlay) => !subFilter || subFilter === overlay[this.filterField])
			.reduce((minValue, value) => value.bestResolution < minValue.bestResolution ? value : minValue);
		this.displayOverlayEvent($event, bestOverlay);
	}

	clickFirst($event: MouseEvent, subFilter?: string) {
		const firstOverlay = this.filteredOverlays
			.find((overlay: IOverlay) => !subFilter || subFilter === overlay[this.filterField]);
		this.displayOverlayEvent($event, firstOverlay);
	}

	clickLast($event: MouseEvent, subFilter?: string) {
		const lastOverlay = [...this.filteredOverlays]
			.reverse()
			.find((overlay: IOverlay) => !subFilter || subFilter === overlay[this.filterField]);
		this.displayOverlayEvent($event, lastOverlay);
	}

	clickAngle($event: MouseEvent) {
		event.stopPropagation();
		this.store.dispatch(new ContextMenuShowAngleFilter(this.angleFilter));
	}

	displayOverlayEvent(event$: MouseEvent, overlay?) {
		event$.stopPropagation();
		if (overlay) {
			this.store.dispatch(new ContextMenuDisplayAction(overlay.id));
		}
	}

	setPinPoint() {
		this.store.dispatch(new ContextMenuTriggerAction(this.point.coordinates));
	}

	getSensorType(sensorType: string) {
		if (sensorType in this.config.sensorTypeShortcuts) {
			return this.config.sensorTypeShortcuts[sensorType];
		}

		return sensorType;
	}

	isDisabled(subList: string) {
		if (subList === 'angleFilter') {
			return !this[subList] || this[subList].angles.length === 0;
		}else {
			return !this[subList] || this[subList].length === 0;
		}
	}

	asList(subList: string) {
		return subList !== 'angleFilter'
	}
}
