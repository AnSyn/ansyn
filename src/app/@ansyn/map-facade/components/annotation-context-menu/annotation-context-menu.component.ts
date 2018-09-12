import { Component, ElementRef, HostBinding, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { MapEffects } from '../../effects/map.effects';
import { IMapState } from '../../reducers/map.reducer';
import { Store } from '@ngrx/store';
import { AnnotationRemoveFeature, AnnotationSelectAction, AnnotationUpdateFeature } from '../../actions/map.actions';
import {
	AnnotationInteraction,
	IAnnotationsSelectionEventData
} from '@ansyn/core';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { filter, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
	selector: 'ansyn-annotations-context-menu',
	templateUrl: './annotation-context-menu.component.html',
	styleUrls: ['./annotation-context-menu.component.less']
})
@AutoSubscriptions({
	init: 'ngOnInit',
	destroy: 'ngOnDestroy'
})
export class AnnotationContextMenuComponent implements OnInit, OnDestroy {
	clickMenuProps: IAnnotationsSelectionEventData;
	hoverMenuProps: IAnnotationsSelectionEventData;
	@Input() mapId;

	@AutoSubscription
	positionChanged$: Observable<any> = this.mapEffect.positionChanged$.pipe(
		tap(() => this.clickMenuProps = null)
	);

	@AutoSubscription
	annotationContextMenuTrigger$ = this.mapEffect.annotationContextMenuTrigger$.pipe(
		filter(({ payload }) => payload.mapId === this.mapId),
		tap((action: AnnotationSelectAction) => {
			const { boundingRect } = action.payload;
			switch (action.payload.interactionType) {
				case AnnotationInteraction.click:
					this.clickMenuProps = action.payload;
					break;
				case AnnotationInteraction.hover:
					if ((!this.clickMenuProps || this.clickMenuProps.featureId !== action.payload.featureId) && boundingRect) {
						this.hoverMenuProps = action.payload;
					} else {
						this.hoverMenuProps = null;
					}
					break;
			}
		})
	);

	@HostBinding('attr.tabindex')
	get tabindex() {
		return 0;
	}

	@HostListener('contextmenu', ['$event']) contextmenu($event: MouseEvent) {
		$event.preventDefault();
	}

	@HostListener('window:mousewheel') onMousewheel() {
		this.close();
	}

	constructor(public store: Store<IMapState>, public mapEffect: MapEffects, public host: ElementRef) {
	}

	ngOnInit() {
	}

	close() {
		this.clickMenuProps = null;
	}

	ngOnDestroy(): void {
	}

	removeFeature() {
		const { featureId } = this.clickMenuProps;
		this.close();
		this.store.dispatch(new AnnotationRemoveFeature(featureId));
	}

	toggleMeasures() {
		const { featureId } = this.clickMenuProps;
		const showMeasures = !this.clickMenuProps.showMeasures;
		this.store.dispatch(new AnnotationUpdateFeature({
			featureId,
			properties: { showMeasures }
		}));
		this.clickMenuProps.showMeasures = showMeasures;
	}

	toggleLabel() {
		const { featureId } = this.clickMenuProps;
		const showLabel = !this.clickMenuProps.showLabel;
		this.store.dispatch(new AnnotationUpdateFeature({
			featureId,
			properties: { showLabel }
		}));

		this.clickMenuProps.showLabel = showLabel;
	}

	updateLabel() {
		const { featureId } = this.clickMenuProps;

		this.store.dispatch(new AnnotationUpdateFeature({
			featureId,
			properties: {
				label: this.clickMenuProps.label
			}
		}));
		this.close();
	}
}
