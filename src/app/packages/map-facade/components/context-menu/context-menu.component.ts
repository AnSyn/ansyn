import { Component, ElementRef, HostBinding, HostListener, OnInit, Renderer2 } from '@angular/core';
import { IMapState } from '../../reducers/map.reducer';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { ContextMenuDisplayAction, ContextMenuShowAction, PinPointTriggerAction } from '../../actions/map.actions';
import { MapEffects } from '../../effects/map.effects';
import { get as _get, isEmpty as _isEmpty, isEqual as _isEqual, isNil as _isNil, uniq as _uniq } from 'lodash';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/distinctUntilChanged';

@Component({
	selector: 'ansyn-context-menu',
	templateUrl: './context-menu.component.html',
	styleUrls: ['./context-menu.component.less']
})
export class ContextMenuComponent implements OnInit {
	mapState = this.store.select('map');
	filteredOverlays$: Observable<any[]> = this.mapState.map((state: IMapState) => state.filteredOverlays).distinctUntilChanged(_isEqual);
	filteredOverlays: any[];
	displayedOverlay$: Observable<any> = this.mapState.map((state: IMapState) => state.displayedOverlay).distinctUntilChanged(_isEqual);
	displayedOverlay: any;
	displayedOverlayIndex: number;
	nextSensors = [];
	prevSensors = [];
	allSensors = [];
	contextMenuShowAction: ContextMenuShowAction;

	private point: GeoJSON.Point;

	@HostBinding('attr.tabindex')
	get tabindex() {
		return 0;
	}

	@HostListener('window:mousewheel')
	get onmousewheel() {
		return this.hide;
	}

	@HostListener('contextmenu', ['$event'])
	contextmenu($event) {
		$event.preventDefault();
	}

	get _isEmpty() {
		return _isEmpty;
	}

	constructor(private store: Store<IMapState>,
				private mapEffects: MapEffects,
				private elem: ElementRef,
				private renderer: Renderer2) {
	}

	ngOnInit(): void {
		this.filteredOverlays$.subscribe(_filteredOverlays => {
			this.filteredOverlays = _filteredOverlays;
		});
		this.displayedOverlay$.subscribe(_displayedOverlay => {
			this.displayedOverlay = _displayedOverlay;
		});
		this.mapEffects.onContextMenuShow$.subscribe(this.show.bind(this));
	}

	show(action: ContextMenuShowAction) {
		this.contextMenuShowAction = action;
		this.point = action.payload.point;
		this.renderer.setStyle(this.elem.nativeElement, 'top', `${action.payload.e.y}px`);
		this.renderer.setStyle(this.elem.nativeElement, 'left', `${action.payload.e.x}px`);
		this.elem.nativeElement.focus();
		this.initializeSensors();
	}

	initializeSensors() {
		const sensorsOnly = this.filteredOverlays
			.filter(({ id }) => _get(this.displayedOverlay, 'id') !== id)
			.map(({ sensorName }) => sensorName);
		this.allSensors = _uniq(sensorsOnly);
		this.displayedOverlayIndex = this.filteredOverlays
			.findIndex(({ id }) => _get(this.displayedOverlay, 'id') === id);

		if (this.displayedOverlayIndex === -1) {
			if (_isNil(this.displayedOverlay)) {
				this.prevSensors = [];
				this.nextSensors = Array.from(this.allSensors);
			}
		} else {
			this.prevSensors = _uniq(sensorsOnly.slice(0, this.displayedOverlayIndex));
			this.nextSensors = _uniq(sensorsOnly.slice(this.displayedOverlayIndex + 1, this.filteredOverlays.length));
		}
	}

	hide() {
		this.elem.nativeElement.blur();
	}

	clickNext($event: MouseEvent, subFilter?: string) {
		const nextOverlay = this.filteredOverlays
			.slice(this.displayedOverlayIndex + 1, this.filteredOverlays.length)
			.find(({ id, sensorName }) => !subFilter || subFilter === sensorName);
		this.displayOverlayEvent($event, nextOverlay);
	}

	clickPrev($event: MouseEvent, subFilter?: string) {
		const prevOverlay = this.filteredOverlays
			.slice(0, this.displayedOverlayIndex)
			.reverse()
			.find(({ sensorName }) => !subFilter || subFilter === sensorName);
		this.displayOverlayEvent($event, prevOverlay);
	}

	clickBest($event: MouseEvent, subFilter?: string) {
		const sensorOnly = this.filteredOverlays.filter(({ sensorName }) => !subFilter || subFilter === sensorName);
		const bestOverlay = sensorOnly.reduce((minValue, value) => {
			return value.bestResolution < minValue.bestResolution ? value : minValue;
		});
		this.displayOverlayEvent($event, bestOverlay);
	}

	clickFirst($event: MouseEvent, subFilter?: string) {
		const firstOverlay = this.filteredOverlays
			.find(({ sensorName }) => !subFilter || subFilter === sensorName);
		this.displayOverlayEvent($event, firstOverlay);
	}

	clickLast($event: MouseEvent, subFilter?: string) {
		const lastOverlay = [...this.filteredOverlays]
			.reverse()
			.find(({ sensorName }) => !subFilter || subFilter === sensorName);
		this.displayOverlayEvent($event, lastOverlay);
	}

	displayOverlayEvent(event$: MouseEvent, overlay?) {
		event$.stopPropagation();
		if (overlay) {
			this.store.dispatch(new ContextMenuDisplayAction(overlay.id));
		}
	}

	setPinPoint() {
		this.store.dispatch(new PinPointTriggerAction(this.point.coordinates));
	}
}
