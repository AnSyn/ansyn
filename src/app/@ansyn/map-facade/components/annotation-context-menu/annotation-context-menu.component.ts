import { Component, ElementRef, HostBinding, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { MapEffects } from '../../effects/map.effects';
import { IMapState } from '../../reducers/map.reducer';
import { Store } from '@ngrx/store';
import {
	AnnotationSelectAction,
	AnnotationRemoveFeature,
	AnnotationUpdateFeature
} from '../../actions/map.actions';
import { Subscription } from 'rxjs/Subscription';
import { AnnotationInteraction, IAnnotationsSelectionEventData } from '@ansyn/core/models/visualizers/annotations.model';

@Component({
	selector: 'ansyn-annotations-context-menu',
	templateUrl: './annotation-context-menu.component.html',
	styleUrls: ['./annotation-context-menu.component.less']
})
export class AnnotationContextMenuComponent implements OnInit, OnDestroy {
	action: AnnotationSelectAction;
	contextMenuWrapperStyle;
	private _subscriptions: Subscription[] = [];

	@Input() mapId;
	@Input() interactionType: AnnotationInteraction;

	get fromHover() {
		return this.interactionType === AnnotationInteraction.hover;
	}

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
				.filter(({ payload }) => payload.mapId === this.mapId && payload.interactionType === this.interactionType)
				.subscribe((action: AnnotationSelectAction) => {
					this.action = action;
					const { boundingRect } = <IAnnotationsSelectionEventData> this.action.payload;
					if (boundingRect) {
						this.contextMenuWrapperStyle = {
							top: `${boundingRect.top}px`,
							left: `${boundingRect.left}px`,
							width: `${boundingRect.width}px`,
							height: `${boundingRect.height}px`,
							transform: `rotate(${boundingRect.rotation}deg)`
						};
						if (this.fromHover) {
							this.host.nativeElement.classList.add('visible');
						} else {
							this.host.nativeElement.focus();
						}
					} else {
						if (this.fromHover) {
							this.host.nativeElement.classList.remove('visible');
						} else {
							this.host.nativeElement.blur();
						}
					}
				}),

			this.mapEffect.positionChanged$.subscribe(() => {
				if (this.fromHover) {
					this.host.nativeElement.classList.remove('visible');
				} else {
					this.host.nativeElement.blur();
				}
			})
		);
	}

	ngOnDestroy(): void {
		this._subscriptions.forEach(observable$ => observable$.unsubscribe());
	}

	removeFeature($event) {
		$event.stopPropagation();
		const { featureId } = this.action.payload;
		this.store.dispatch(new AnnotationRemoveFeature(featureId));
	}

	toggleMeasures($event) {
		$event.stopPropagation();
		const { featureId, showMeasures } = this.action.payload;
		this.store.dispatch(new AnnotationUpdateFeature({ featureId, properties: { showMeasures: !showMeasures}}));
	}
}
