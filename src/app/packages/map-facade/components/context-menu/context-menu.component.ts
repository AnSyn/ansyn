import { Component, ElementRef, HostBinding, HostListener, OnInit, Renderer2 } from '@angular/core';
import { IMapState } from '../../reducers/map.reducer';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { ContextMenuDisplayAction, ContextMenuShowAction } from '../../actions/map.actions';
import { MapEffects } from '../../effects/map.effects';
import { isEqual as _isEqual, isEmpty as _isEmpty, get as _get, isNil as _isNil} from 'lodash';


@Component({
	selector: 'ansyn-context-menu',
	templateUrl: './context-menu.component.html',
	styleUrls: ['./context-menu.component.less']
})
export class ContextMenuComponent implements OnInit {
	filteredOverlays$: Observable<any[]> = this.store.select('map').map((state: IMapState) => state.filteredOverlays).distinctUntilChanged(_isEqual);
	filteredOverlays: any[];
	displayedOverlay$: Observable<any> = this.store.select('map').map((state: IMapState) => state.displayedOverlay).distinctUntilChanged(_isEqual);
	displayedOverlay: any;
	displayedOverlayIndex: number;

	nextSensors = [];
	prevSensors = [];
	allSensors = [];

	contextMenuShowAction: ContextMenuShowAction;


	@HostBinding('attr.tabindex') get tabindex() {
		return 0;
	}

	@HostListener('window:mousewheel') get onmousewheel() {
		return this.hide;
	}

	@HostListener('contextmenu', ['$event']) contextmenu($event) {
		$event.preventDefault();
	}

	get _isEmpty () {
		return _isEmpty;
	}

	constructor(private store: Store<IMapState>,
				private mapEffects: MapEffects,
				private elem: ElementRef,
				private renderer: Renderer2) {}

	ngOnInit(): void {
		this.filteredOverlays$.subscribe(_filteredOverlays => {this.filteredOverlays = _filteredOverlays;});
		this.displayedOverlay$.subscribe(_displayedOverlay => {this.displayedOverlay = _displayedOverlay;});
		this.mapEffects.onContextMenuShow$.subscribe(this.show.bind(this));
	}

	show(action: ContextMenuShowAction) {
		this.contextMenuShowAction = action;
		this.renderer.setStyle(this.elem.nativeElement, 'top', `${action.payload.e.y}px`);
		this.renderer.setStyle(this.elem.nativeElement, 'left', `${action.payload.e.x}px`);
		this.elem.nativeElement.focus();
		this.initializeSensors();
	}

	initializeSensors() {
		const sensorsOnly = this.filteredOverlays
			.filter(({id}) => _get(this.displayedOverlay, 'id') !== id)
			.map(({sensorName}) => sensorName);
		this.allSensors = [...new Set(sensorsOnly)];
		this.displayedOverlayIndex = this.filteredOverlays.findIndex((overlay) => overlay.id === _get(this.displayedOverlay, 'id'));

		if(this.displayedOverlayIndex === -1) {
			if(_isNil(this.displayedOverlay)) {
				this.prevSensors = [];
				this.nextSensors = [...this.allSensors];
			}
		} else {
			this.prevSensors = [...new Set(sensorsOnly.slice(0, this.displayedOverlayIndex))];
			this.nextSensors = [...new Set(sensorsOnly.slice(this.displayedOverlayIndex + 1, this.filteredOverlays.length))];
		}

	}

	hide() {
		this.elem.nativeElement.blur();
	}

	clickNext (event$, subFilter?: string) {
		event$.stopPropagation();
		const nextOverlay = this.filteredOverlays
				.slice(this.displayedOverlayIndex + 1, this.filteredOverlays.length)
				.find(({id, sensorName}) => !subFilter || subFilter === subFilter);
		this.store.dispatch(new ContextMenuDisplayAction(nextOverlay.id));
	}

	clickPrev (event$, subFilter?: string) {
		event$.stopPropagation();
		const nextOverlay = this.filteredOverlays
				.slice(0, this.displayedOverlayIndex)
				.find(({sensorName}) => !subFilter || subFilter === sensorName);
		this.store.dispatch(new ContextMenuDisplayAction(nextOverlay.id));
	}

	clickBest (event$, subFilter?: string) {
		event$.stopPropagation();
		const sensorOnly = this.filteredOverlays.filter(({sensorName}) => !subFilter || subFilter === sensorName);
		const bestOverlay = sensorOnly.reduce((minValue, value) => {
			return value.bestResolution < minValue.bestResolution ? value : minValue;
		});
		this.store.dispatch(new ContextMenuDisplayAction(bestOverlay.id));
	}

	clickFirst (event$, subFilter?: string) {
		event$.stopPropagation();
		const firstOverlay = this.filteredOverlays
			.find(({sensorName}) => !subFilter || subFilter === sensorName);
		this.store.dispatch(new ContextMenuDisplayAction(firstOverlay.id));
	}

	clickLast (event$, subFilter?: string) {
		event$.stopPropagation();
		const lastOverlay = this.filteredOverlays.reverse()
				.find(({sensorName}) => !subFilter || subFilter === sensorName );
		this.store.dispatch(new ContextMenuDisplayAction(lastOverlay.id));
	}

}
