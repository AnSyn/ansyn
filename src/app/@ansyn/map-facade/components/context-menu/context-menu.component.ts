import { Component, ElementRef, HostBinding, HostListener, Inject, OnInit, Renderer2 } from '@angular/core';
import { IMapState, mapStateSelector } from '../../reducers/map.reducer';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { ContextMenuDisplayAction, ContextMenuShowAction, ContextMenuTriggerAction } from '../../actions/map.actions';
import { MapEffects } from '../../effects/map.effects';
import { uniq as _uniq } from 'lodash';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/distinctUntilChanged';
import { Overlay } from '@ansyn/core/models/overlay.model';
import { MapFacadeService } from '../../services/map-facade.service';
import { CaseMapState } from '@ansyn/core/models/case.model';
import { IMapFacadeConfig } from '../../models/map-config.model';
import { mapFacadeConfig } from '../../models/map-facade.config';
import { Point } from 'geojson';
import { selectGeoFilter } from '@ansyn/status-bar';

export interface OverlayButton {
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
		return this.config.contextMenu.filterField
	}

	displayedOverlay$: Observable<Overlay> = this.mapState$
		.map(MapFacadeService.activeMap)
		.filter(Boolean)
		.map((activeMap: CaseMapState) => activeMap.data.overlay)
		.distinctUntilChanged();

	filteredOverlays$: Observable<Overlay[]> = this.mapEffects$
		.getFilteredOverlays$
		.map(({ payload }) => payload)
		.withLatestFrom(this.displayedOverlay$, (filteredOverlays: Overlay[], displayedOverlay: Overlay) => {
			const displayedOverlayId = (displayedOverlay && displayedOverlay.id);
			return [
				filteredOverlays.filter(({ id }) => id !== displayedOverlayId),
				displayedOverlay
			];
		})
		.do(([filteredOverlays, displayedOverlay]: [Overlay[], Overlay]) => {
			this.initializeSensors(filteredOverlays, displayedOverlay);
		})
		.map(([filteredOverlays]: [Overlay[], Overlay]) => filteredOverlays);

	geoFilter$ = this.store.select(selectGeoFilter)
		.do((geoFilter) => this.geoFilter = geoFilter);

	geoFilter;

	nextSensors = [];
	prevSensors = [];
	allSensors = [];
	angleList: Array<'Draw' | 'Turn' | 'Show'> = [];
	point: Point;

	private _filteredOverlays: Overlay[];
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


	overlayButtons: OverlayButton[] = [
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
				protected mapEffects$: MapEffects,
				protected elem: ElementRef,
				protected renderer: Renderer2,
				public store$: Store<any>,
				@Inject(mapFacadeConfig) public config: IMapFacadeConfig) {
	}

	pluckFilterField(overlays: Overlay[]) {
		return _uniq(overlays.map((overlay: Overlay) => overlay[this.filterField]));
	}

	ngOnInit(): void {
		this.filteredOverlays$
			.subscribe((filteredOverlays: Overlay[]) => this.filteredOverlays = filteredOverlays);
		this.mapEffects$.onContextMenuShow$.subscribe(this.show.bind(this));
		this.geoFilter$.subscribe();
	}

	show(action: ContextMenuShowAction) {
		this.point = action.payload.point;
		this.renderer.setStyle(this.elem.nativeElement, 'top', `${action.payload.e.y}px`);
		this.renderer.setStyle(this.elem.nativeElement, 'left', `${action.payload.e.x}px`);
		this.elem.nativeElement.focus();
	}

	initializeSensors(filteredOverlays, displayedOverlay?) {
		if (!displayedOverlay) {
			this.prevfilteredOverlays = [...filteredOverlays];
			this.nextfilteredOverlays = [...filteredOverlays];
		} else {
			const displayedOverlayDate = displayedOverlay.date;
			this.prevfilteredOverlays = filteredOverlays
				.filter((overlay: Overlay) => overlay.date < displayedOverlayDate)
				.reverse();

			this.nextfilteredOverlays = filteredOverlays
				.filter((overlay: Overlay) => displayedOverlayDate < overlay.date);
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
			.find((overlay: Overlay) => !subFilter || subFilter === overlay[this.filterField]);
		this.displayOverlayEvent($event, nextOverlay);
	}

	clickPrev($event: MouseEvent, subFilter?: string) {
		const prevOverlay = this.prevfilteredOverlays
			.find((overlay: Overlay) => !subFilter || subFilter === overlay[this.filterField]);
		this.displayOverlayEvent($event, prevOverlay);
	}

	clickBest($event: MouseEvent, subFilter?: string) {
		const bestOverlay = this.filteredOverlays
			.filter((overlay: Overlay) => !subFilter || subFilter === overlay[this.filterField])
			.reduce((minValue, value) => value.bestResolution < minValue.bestResolution ? value : minValue);
		this.displayOverlayEvent($event, bestOverlay);
	}

	clickFirst($event: MouseEvent, subFilter?: string) {
		const firstOverlay = this.filteredOverlays
			.find((overlay: Overlay) => !subFilter || subFilter === overlay[this.filterField]);
		this.displayOverlayEvent($event, firstOverlay);
	}

	clickLast($event: MouseEvent, subFilter?: string) {
		const lastOverlay = [...this.filteredOverlays]
			.reverse()
			.find((overlay: Overlay) => !subFilter || subFilter === overlay[this.filterField]);
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
