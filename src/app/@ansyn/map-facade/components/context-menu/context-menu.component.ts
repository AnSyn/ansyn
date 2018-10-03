import { Component, ElementRef, HostBinding, HostListener, Inject, OnInit, Renderer2 } from '@angular/core';
import { IMapState, mapStateSelector } from '../../reducers/map.reducer';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import {
	ContextMenuDisplayAction,
	ContextMenuShowAction,
	ContextMenuTriggerAction,
	MapActionTypes
} from '../../actions/map.actions';
import { uniq as _uniq } from 'lodash';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/distinctUntilChanged';
import { CaseGeoFilter, ICaseMapState, IOverlay, selectRegion } from '@ansyn/core';
import { MapFacadeService } from '../../services/map-facade.service';
import { IMapFacadeConfig } from '../../models/map-config.model';
import { mapFacadeConfig } from '../../models/map-facade.config';
import { Point } from 'geojson';
import { Actions } from '@ngrx/effects';
import { TranslateService } from '@ngx-translate/core';


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

	displayedOverlay$: Observable<IOverlay> = this.mapState$
		.map(MapFacadeService.activeMap)
		.filter(Boolean)
		.map((activeMap: ICaseMapState) => activeMap.data.overlay)
		.distinctUntilChanged();

	geoFilter$: Observable<CaseGeoFilter> = this.store.select(selectRegion)
		.filter(Boolean)
		.do((region) => this.geoFilter = region.type);

	geoFilter;

	nextSensors = [];
	prevSensors = [];
	allSensors = [];
	angleList: Array<'Draw' | 'Turn' | 'Show'> = [];
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
			subList: 'angleList',
			action: () => {
			}
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
				public translate: TranslateService,
				public store$: Store<any>,
				@Inject(mapFacadeConfig) public config: IMapFacadeConfig) {
	}

	pluckFilterField(overlays: IOverlay[]) {
		return _uniq(overlays.map((overlay: IOverlay) => overlay[this.filterField]));
	}

	ngOnInit(): void {

		this.actions$
			.ofType(MapActionTypes.CONTEXT_MENU.SHOW)
			.do(this.show.bind(this))
			.withLatestFrom(this.displayedOverlay$)
			.do(this.setFilteredOverlays.bind(this))
			.subscribe();
		this.geoFilter$.subscribe();
	}

	setFilteredOverlays([action, displayedOverlay]: [ContextMenuShowAction, IOverlay]) {
		const displayedOverlayId = (displayedOverlay && displayedOverlay.id);
		const filteredOverlays = action.payload.overlays.filter(({ id }) => id !== displayedOverlayId);
		this.initializeSensors(filteredOverlays, displayedOverlay);
		this.filteredOverlays = filteredOverlays;
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
		return !this[subList] || this[subList].length === 0;
	}
}
