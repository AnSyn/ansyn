import { Component, ElementRef, HostBinding, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { MapEffects } from '../../effects/map.effects';
import { IMapState, selectMapsList } from '../../reducers/map.reducer';
import { Store, select } from '@ngrx/store';
import {
	AnnotationRemoveFeature,
	AnnotationSelectAction,
	AnnotationUpdateFeature,
	MapActionTypes
} from '../../actions/map.actions';
import { AnnotationInteraction, IAnnotationsSelectionEventData, ICaseMapState, IOverlay } from '@ansyn/core';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { filter, tap, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Actions } from '@ngrx/effects';
import { ofType } from '@ngrx/effects';
import { MapFacadeService } from '../../services/map-facade.service';

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
	overlay: IOverlay;

	@AutoSubscription
	positionChanged$: Observable<any> = this.actions$.pipe(
		ofType(MapActionTypes.POSITION_CHANGED),
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

	@AutoSubscription
	currentOverlay$ = this.store.pipe(
		select(selectMapsList),
		map((mapList) => MapFacadeService.mapById(mapList, this.mapId)),
		filter(Boolean),
		map((map: ICaseMapState) => map.data.overlay),
		tap((overlay) => this.overlay = overlay)
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

	constructor(public store: Store<IMapState>, public mapEffect: MapEffects, public actions$: Actions, public host: ElementRef) {
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

	toggleColorPicker() {
		const { featureId } = this.clickMenuProps;
		const showColorPicker = !this.clickMenuProps.showColorPicker;
		this.store.dispatch(new AnnotationUpdateFeature({
			featureId,
			properties: { showColorPicker, showWeight: !showColorPicker }
		}));
		this.clickMenuProps.showColorPicker = showColorPicker;
		this.clickMenuProps.showWeight = showColorPicker ? !showColorPicker : this.clickMenuProps.showWeight;
	}

	toggleWeight() {
		const { featureId } = this.clickMenuProps;
		const showWeight = !this.clickMenuProps.showWeight;
		this.store.dispatch(new AnnotationUpdateFeature({
			featureId,
			properties: { showWeight, showColorPicker: !showWeight }
		}));
		this.clickMenuProps.showWeight = showWeight;
		this.clickMenuProps.showColorPicker = showWeight ? !showWeight : this.clickMenuProps.showWeight;
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

	toggleLabel(label) {
		const { featureId } = this.clickMenuProps;
		const showLabel = !this.clickMenuProps[label];
		this.store.dispatch(new AnnotationUpdateFeature({
			featureId,
			properties: { [label]: showLabel }
		}));

		this.clickMenuProps[label] = showLabel;
	}

	selectLineWidth(w: number) {
		const { featureId } = this.clickMenuProps;
		const style = {
			...this.clickMenuProps.style,
			initial: {
				...this.clickMenuProps.style.initial,
				'stroke-width': w
			}
		};

		this.store.dispatch(new AnnotationUpdateFeature({
			featureId,
			properties: { style }
		}));

		this.clickMenuProps.style = style;
	}

	activeChange($event: { label: 'stroke' | 'fill', event: string }) {
		let opacity = { stroke: 1, fill: 0.4 };
		const { featureId } = this.clickMenuProps;
		const style = {
			...this.clickMenuProps.style,
			initial: {
				...this.clickMenuProps.style.initial,
				[`${$event.label}-opacity`]: $event.event ? opacity[$event.label] : 0
			}
		};

		this.store.dispatch(new AnnotationUpdateFeature({
			featureId,
			properties: { style }
		}));

		this.clickMenuProps.style = style;
	}

	colorChange($event: { label: 'stroke' | 'fill', event: string }) {
		const { featureId } = this.clickMenuProps;
		const style = {
			...this.clickMenuProps.style,
			initial: {
				...this.clickMenuProps.style.initial,
				[$event.label]: $event.event
			}
		};

		this.store.dispatch(new AnnotationUpdateFeature({
			featureId,
			properties: { style }
		}));

		this.clickMenuProps.style = style;
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

	updateCount(count: number) {
		const { featureId } = this.clickMenuProps;

		this.store.dispatch(new AnnotationUpdateFeature({
			featureId,
			properties: {
				tags: {
					...this.clickMenuProps.tags,
					[this.overlay.id]: {
						count,
						sourceType: this.overlay.sourceType,
						sensorName: this.overlay.sensorName,
						sensorType: this.overlay.sensorType,
						id: this.overlay.id,
						time: this.overlay.date.toISOString()
					}
				}
			}
		}));
		this.close();
	}
}
