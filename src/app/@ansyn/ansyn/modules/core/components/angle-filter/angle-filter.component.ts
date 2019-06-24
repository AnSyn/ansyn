import { Component, ElementRef, HostListener, OnDestroy, OnInit, Renderer2, HostBinding } from '@angular/core';
import { IEntryComponent, MapActionTypes } from '@ansyn/map-facade';
import { Actions, ofType } from '@ngrx/effects';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { tap, debounceTime } from 'rxjs/operators';
import { ContextMenuShowAngleFilter } from '../../../../../map-facade/actions/map.actions';
import { IOverlay } from '../../../overlays/models/overlay.model';

@Component({
	selector: 'ansyn-angle-filter',
	templateUrl: './angle-filter.component.html',
	styleUrls: ['./angle-filter.component.less']
})
@AutoSubscriptions()
export class AngleFilterComponent implements OnInit, OnDestroy, IEntryComponent {

	mapId: string;

	overlays: IOverlay[];

	@AutoSubscription
	showAngleFilter$ = this.actions$.pipe(
		ofType(MapActionTypes.CONTEXT_MENU.ANGLE_FILTER_SHOW),
		debounceTime(200),
		tap(this.show.bind(this))
	);

	@HostBinding('attr.tabindex')
	get tabindex() {
		return 1;
	}

	@HostListener('window:mousewheel')
	get onMousewheel() {
		return this.hide;
	}

	@HostListener('contextmenu', ['$event'])
	onContextMenu($event) {
		$event.preventDefault();
	}


	constructor(protected actions$: Actions,
				protected elem: ElementRef,
				protected renderer: Renderer2) {
	}

	ngOnInit() {
	}

	ngOnDestroy(): void {
	}

	show(action: ContextMenuShowAngleFilter) {
		this.overlays = action.payload.overlays;
		this.renderer.setStyle(this.elem.nativeElement, 'top', `${action.payload.event.y}px`);
		this.renderer.setStyle(this.elem.nativeElement, 'left', `${action.payload.event.x}px`);
		this.elem.nativeElement.focus();
	}

	hide() {
		this.elem.nativeElement.blur();

	}



	getType(): string {
		return '';
	}

	print(event: MouseEvent, overlay: any) {
		console.log(event);
		console.log(overlay);
	}
}
