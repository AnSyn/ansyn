import { Component, ElementRef, HostBinding, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { MapEffects } from '../../effects/map.effects';
import { IMapState } from '../../reducers/map.reducer';
import { Store } from '@ngrx/store';
import { AnnotationRemoveFeature, AnnotationSelectAction, AnnotationUpdateFeature } from '../../actions/map.actions';
import { AnnotationInteraction } from '@ansyn/core/models/visualizers/annotations.model';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { filter, tap } from 'rxjs/operators';

export interface IMenuProps {
	style: any;
	featureId: string;
	label?: string,
	showLabel?: boolean
	showMeasures?: boolean;
}

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
	clickMenuProps: IMenuProps;
	hoverMenuProps: IMenuProps;
	@Input() mapId;

	@AutoSubscription
	positionChanged$ = this.mapEffect.positionChanged$.pipe(
		tap(() => this.clickMenuProps = null)
	);

	@AutoSubscription
	annotationContextMenuTrigger$ = this.mapEffect.annotationContextMenuTrigger$.pipe(
		filter(({ payload }) => payload.mapId === this.mapId),
		tap((action: AnnotationSelectAction) => {
			const { boundingRect } = action.payload;
			switch (action.payload.interactionType) {
				case AnnotationInteraction.click:
					this.clickMenuProps = {
						style: {
							top: `${boundingRect.top}px`,
							left: `${boundingRect.left}px`,
							width: `${boundingRect.width}px`,
							height: `${boundingRect.height}px`,
							transform: `rotate(${boundingRect.rotation}deg)`
						},
						featureId: action.payload.featureId,
						label: action.payload.label,
						showLabel: action.payload.showLabel,
						showMeasures: action.payload.showMeasures
					};
					break;
				case AnnotationInteraction.hover:
					if ((!this.clickMenuProps || this.clickMenuProps.featureId !== action.payload.featureId) && boundingRect) {
						this.hoverMenuProps = {
							style: {
								top: `${boundingRect.top}px`,
								left: `${boundingRect.left}px`,
								width: `${boundingRect.width}px`,
								height: `${boundingRect.height}px`,
								transform: `rotate(${boundingRect.rotation}deg)`
							},
							featureId: action.payload.featureId
						};
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
		this.clickMenuProps = null;
	}

	constructor(public store: Store<IMapState>, public mapEffect: MapEffects, public host: ElementRef) {
	}

	ngOnInit() {
	}

	clickoutside() {
		this.clickMenuProps = null;
	}

	ngOnDestroy(): void {
	}

	removeFeature() {
		const { featureId } = this.clickMenuProps;
		this.clickMenuProps = null;
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
		this.clickoutside();
	}
}
