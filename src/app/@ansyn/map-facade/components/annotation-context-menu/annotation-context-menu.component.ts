import { Component, ElementRef, HostBinding, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { MapEffects } from '../../effects/map.effects';
import { IMapState } from '../../reducers/map.reducer';
import { Store } from '@ngrx/store';
import { AnnotationContextMenuTriggerAction, AnnotationRemoveFeature } from '../../actions/map.actions';
import { Subscription } from 'rxjs/Subscription';

@Component({
	selector: 'ansyn-annotations-context-menu',
	templateUrl: './annotation-context-menu.component.html',
	styleUrls: ['./annotation-context-menu.component.less']
})
export class AnnotationContextMenuComponent implements OnInit, OnDestroy {
	action: AnnotationContextMenuTriggerAction;
	contextMenuWrapperStyle;
	private _subscriptions: Subscription[] = [];

	@Input() mapId;

	@HostBinding('attr.tabindex')
	get tabindex() {
		return 0;
	}

	@HostListener('contextmenu', ['$event']) contextmenu($event: MouseEvent) {
		$event.preventDefault();
	}

	@HostListener('window:mousewheel') onMousewheel() {
		this.host.nativeElement.blur();
	}

	constructor(public store: Store<IMapState>, public mapEffect: MapEffects, public host: ElementRef) {
	}

	ngOnInit() {
		this._subscriptions.push(
			this.mapEffect.annotationContextMenuTrigger$
				.filter(({payload}) => payload.mapId === this.mapId)
				.subscribe((action: AnnotationContextMenuTriggerAction) => {
					this.action = action;
					const {boundingRect} = <any> this.action.payload;
					this.contextMenuWrapperStyle = {
						top: `${boundingRect.top}px`,
						left: `${boundingRect.left}px`,
						width: `${boundingRect.width}px`,
						height: `${boundingRect.height}px`,
						transform: `rotate(${boundingRect.rotation}deg)`
					};
					this.host.nativeElement.focus();
				}),

			this.mapEffect.positionChanged$.subscribe(() => {
				this.host.nativeElement.blur();
			})
		);
	}

	ngOnDestroy(): void {
		this._subscriptions.forEach(observable$ => observable$.unsubscribe());
	}

	removeFeature($event) {
		$event.stopPropagation();
		const {featureId} = this.action.payload;
		this.store.dispatch(new AnnotationRemoveFeature(featureId));
	}
}
