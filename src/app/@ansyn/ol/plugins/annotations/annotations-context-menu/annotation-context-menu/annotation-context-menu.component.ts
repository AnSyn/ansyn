import { Component, ElementRef, HostBinding, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { filter, take, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { CommunicatorEntity, ImageryCommunicatorService, IMapSettings } from '@ansyn/imagery';
import { AnnotationsVisualizer } from '../../annotations.visualizer';
import { AnnotationInteraction, IAnnotationsSelectionEventData } from '../../annotations.model';

@Component({
	selector: 'ansyn-annotations-context-menu',
	templateUrl: './annotation-context-menu.component.html',
	styleUrls: ['./annotation-context-menu.component.less']
})
@AutoSubscriptions({
	init: 'onInitMap',
	destroy: 'ngOnDestroy'
})
export class AnnotationContextMenuComponent implements OnInit, OnDestroy {
	clickMenuProps: IAnnotationsSelectionEventData;
	hoverMenuProps: IAnnotationsSelectionEventData;
	annotations: AnnotationsVisualizer;
	communicator: CommunicatorEntity;
	@Input() mapState: IMapSettings;
	@HostBinding('attr.tabindex') tabindex = 0;

	@AutoSubscription
	positionChanged$ = (): Observable<any> => this.communicator.positionChanged.pipe(
		tap(() => this.clickMenuProps = null)
	);

	@AutoSubscription
	annotationContextMenuTrigger$ = () => this.annotations.events.onSelect.pipe(
		filter((payload) => payload.mapId === this.mapState.id),
		tap((payload: IAnnotationsSelectionEventData) => {
			const { boundingRect } = payload;
			switch (payload.interactionType) {
				case AnnotationInteraction.click:
					this.clickMenuProps = payload;
					break;
				case AnnotationInteraction.hover:
					if ((!this.clickMenuProps || this.clickMenuProps.featureId !== payload.featureId) && boundingRect) {
						this.hoverMenuProps = payload;
					} else {
						this.hoverMenuProps = null;
					}
					break;
			}
		})
	);

	@HostListener('contextmenu', ['$event']) contextmenu($event: MouseEvent) {
		$event.preventDefault();
	}

	@HostListener('window:mousewheel') onMousewheel() {
		this.close();
	}

	constructor(public host: ElementRef, protected communicators: ImageryCommunicatorService) {
	}

	onInitMap() {
	}

	ngOnInit() {
		this.communicators.instanceCreated.pipe(
			filter(({ id }) => id === this.mapState.id),
			tap(() => {
				this.communicator = this.communicators.provide(this.mapState.id);
				this.annotations = this.communicator.getPlugin(AnnotationsVisualizer);
				this.onInitMap();
			}),
			take(1)
		).subscribe();
	}

	close() {
		this.clickMenuProps = null;
	}

	ngOnDestroy(): void {
	}

	removeFeature() {
		const { featureId } = this.clickMenuProps;
		this.close();
		this.annotations.removeFeature(featureId);
	}

	toggleColorPicker() {
		const showColorPicker = !this.clickMenuProps.showColorPicker;
		this.clickMenuProps.showColorPicker = showColorPicker;
		this.clickMenuProps.showWeight = showColorPicker ? !showColorPicker : this.clickMenuProps.showWeight;
	}

	toggleWeight() {
		const showWeight = !this.clickMenuProps.showWeight;
		this.clickMenuProps.showWeight = showWeight;
		this.clickMenuProps.showColorPicker = showWeight ? !showWeight : this.clickMenuProps.showWeight;
	}

	toggleMeasures() {
		const { featureId } = this.clickMenuProps;
		const showMeasures = !this.clickMenuProps.showMeasures;
		this.annotations.updateFeature(featureId, { showMeasures });
		this.clickMenuProps.showMeasures = showMeasures;
	}

	toggleLabel() {
		const { featureId } = this.clickMenuProps;
		const showLabel = !this.clickMenuProps.showLabel;
		this.annotations.updateFeature(featureId, { showLabel });
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

		this.annotations.updateFeature(featureId, { style });
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
		this.annotations.updateFeature(featureId, { style });
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
		this.annotations.updateFeature(featureId, { style });
		this.clickMenuProps.style = style;
	}

	updateLabel() {
		const { featureId } = this.clickMenuProps;
		this.annotations.updateFeature(featureId, { label: this.clickMenuProps.label });
		this.close();
	}
}
