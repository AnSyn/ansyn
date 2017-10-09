import { Component, ElementRef, HostBinding, HostListener, OnInit, Renderer2 } from '@angular/core';
import { IMapState } from '../../reducers/map.reducer';
import { Action, Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { ContextMenuDisplayAction, ContextMenuShowAction, PinPointTriggerAction } from '../../actions/map.actions';
import { MapEffects } from '../../effects/map.effects';
import { get as _get, isEmpty as _isEmpty, isNil as _isNil, uniq as _uniq } from 'lodash';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/distinctUntilChanged';
import { Overlay } from '@ansyn\/core/models/overlay.model';
import { MapFacadeService } from '../../services/map-facade.service';
import { CaseMapState } from '../../../core/models/case.model';
import { toPayload } from '@ngrx/effects';

interface OverlayButton {
	name: string;
	subList: string;
	action: Function
}

@Component({
	selector: 'ansyn-context-menu',
	templateUrl: './context-menu.component.html',
	styleUrls: ['./context-menu.component.less']
})
export class ContextMenuComponent implements OnInit {
	static filterField = 'sensorType';

	get filterField() {
		return ContextMenuComponent.filterField;
	}

	mapState$ = this.store.select <IMapState>('map');

	filteredOverlays$: Observable<Overlay[]> = this.mapEffects$
		.getFilteredOverlays$
		.map <Action, Overlay[]>(toPayload);

	displayedOverlay$: Observable<Overlay> = this.mapState$
		.map(MapFacadeService.activeMap)
		.filter((activeMap: CaseMapState) => Boolean(activeMap))
		.map((activeMap: CaseMapState) => activeMap.data.overlay)
		.distinctUntilChanged();

	displayedOverlay: Overlay;
	filteredOverlays: Overlay[];
	displayedOverlayIndex: number;
	nextSensors = [];
	prevSensors = [];
	allSensors = [];
	angleList: Array<'Draw'|'Turn'|'Show'> = [];
	point: GeoJSON.Point;

	overlayButtons: OverlayButton[] = [
		{
			name: 'last',
			subList: 'nextSensors',
			action: this.clickLast.bind(this),
		},
		{
			name: 'first',
			subList: 'prevSensors',
			action: this.clickFirst.bind(this),
		},
		{
			name: 'next',
			subList: 'nextSensors',
			action: this.clickNext.bind(this),
		},
		{
			name: 'prev',
			subList: 'prevSensors',
			action: this.clickPrev.bind(this),
		},
		{
			name: 'best',
			subList: 'allSensors',
			action: this.clickBest.bind(this),
		},
		{
			name: 'angle',
			subList: 'angleList',
			action: () => {
			},
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

	get _isEmpty() {
		return _isEmpty;
	}

	constructor(private store: Store<IMapState>,
				private mapEffects$: MapEffects,
				private elem: ElementRef,
				private renderer: Renderer2) {
	}

	ngOnInit(): void {
		this.filteredOverlays$.subscribe((filteredOverlays: Overlay[]) => {
			this.filteredOverlays = filteredOverlays;
		});

		this.displayedOverlay$.subscribe((displayedOverlay: Overlay) => {
			this.displayedOverlay = displayedOverlay;
		});

		this.mapEffects$.onContextMenuShow$.subscribe(this.show.bind(this));
	}

	show(action: ContextMenuShowAction) {
		this.point = action.payload.point;
		this.renderer.setStyle(this.elem.nativeElement, 'top', `${action.payload.e.y}px`);
		this.renderer.setStyle(this.elem.nativeElement, 'left', `${action.payload.e.x}px`);
		this.elem.nativeElement.focus();
		this.initializeSensors();
	}

	initializeSensors() {
		const sensorsOnly = this.filteredOverlays
			.filter(({ id }) => _get(this.displayedOverlay, 'id') !== id)
			.map((overlay: Overlay) => overlay[this.filterField]);
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

	isClick($event: MouseEvent): boolean {
		return $event.which === 1;
	}

	clickNext($event: MouseEvent, subFilter?: string) {
		const nextOverlay = this.filteredOverlays
			.slice(this.displayedOverlayIndex + 1, this.filteredOverlays.length)
			.find((overlay: Overlay) => !subFilter || subFilter === overlay[this.filterField]);
		this.displayOverlayEvent($event, nextOverlay);
	}

	clickPrev($event: MouseEvent, subFilter?: string) {
		const prevOverlay = this.filteredOverlays
			.slice(0, this.displayedOverlayIndex)
			.reverse()
			.find((overlay: Overlay) => !subFilter || subFilter === overlay[this.filterField]);
		this.displayOverlayEvent($event, prevOverlay);
	}

	clickBest($event: MouseEvent, subFilter?: string) {
		const sensorOnly = this.filteredOverlays.filter((overlay: Overlay) => !subFilter || subFilter === overlay[this.filterField]);
		const bestOverlay = sensorOnly.reduce((minValue, value) => {
			return value.bestResolution < minValue.bestResolution ? value : minValue;
		});
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
		this.store.dispatch(new PinPointTriggerAction(this.point.coordinates));
	}
}
