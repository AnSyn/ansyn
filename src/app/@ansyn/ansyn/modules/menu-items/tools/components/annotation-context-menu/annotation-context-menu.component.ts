import { Component, ElementRef, HostBinding, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { IEntryComponent, IMapState } from '@ansyn/map-facade';
import { Store } from '@ngrx/store';
import { MapActionTypes } from '@ansyn/map-facade';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { filter, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Actions, ofType } from '@ngrx/effects';
import {
	AnnotationRemoveFeature,
	AnnotationSelectAction,
	AnnotationUpdateFeature,
	ToolsActionsTypes
} from '../../actions/tools.actions';
import { IMapSettings } from '@ansyn/imagery';
import { AnnotationInteraction, IAnnotationsSelectionEventData } from '@ansyn/ol';

@Component({
	selector: 'ansyn-annotations-context-menu',
	templateUrl: './annotation-context-menu.component.html',
	styleUrls: ['./annotation-context-menu.component.less']
})
@AutoSubscriptions({
	init: 'ngOnInit',
	destroy: 'ngOnDestroy'
})
export class AnnotationContextMenuComponent implements OnInit, OnDestroy, IEntryComponent {
	clickMenuProps: IAnnotationsSelectionEventData;
	hoverMenuProps: IAnnotationsSelectionEventData;
	@Input() mapState: IMapSettings;

	@AutoSubscription
	positionChanged$: Observable<any> = this.actions$.pipe(
		ofType(MapActionTypes.POSITION_CHANGED),
		tap(() => this.clickMenuProps = null)
	);

	@AutoSubscription
	annotationContextMenuTrigger$ = this.actions$.pipe(
		ofType<AnnotationSelectAction>(ToolsActionsTypes.ANNOTATION_SELECT),
		filter(({ payload }) => payload.mapId === this.mapState.id),
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

	constructor(public store: Store<IMapState>, public actions$: Actions, public host: ElementRef) {
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

	toggleLabel() {
		const { featureId } = this.clickMenuProps;
		const showLabel = !this.clickMenuProps.showLabel;
		this.store.dispatch(new AnnotationUpdateFeature({
			featureId,
			properties: { showLabel }
		}));

		this.clickMenuProps.showLabel = showLabel;
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
}
