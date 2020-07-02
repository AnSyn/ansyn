import { Component, ElementRef, HostBinding, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { CommunicatorEntity, ImageryCommunicatorService, IMapInstanceChanged } from '@ansyn/imagery';
import { filter, take, tap } from 'rxjs/operators';
import { AnnotationsVisualizer } from '../../../annotations.visualizer';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { selectIsMinimalistViewMode } from '@ansyn/map-facade';
import { Store } from '@ngrx/store';

export enum AnnotationsContextmenuTabs {
	Colors,
	Weight,
	Label
}

@Component({
	selector: 'ansyn-annotations-context-menu',
	templateUrl: './annotation-context-menu.component.html',
	styleUrls: ['./annotation-context-menu.component.less']
})

@AutoSubscriptions()
export class AnnotationContextMenuComponent implements OnInit, OnDestroy {
	annotations: AnnotationsVisualizer;
	communicator: CommunicatorEntity;
	selectedTab: { [id: string]: AnnotationsContextmenuTabs } = {};

	selection: string[];
	hoverFeatureId: string;
	show: boolean;

	@Input() mapId: string;
	@HostBinding('attr.tabindex') tabindex = 0;

	@AutoSubscription
	isMinimalistViewMode$ = this.store$.select(selectIsMinimalistViewMode).pipe(
		tap(isMinimalistViewMode => {
			this.show = !isMinimalistViewMode;
		})
	);

	subscribers = [];
	annotationsSubscribers = [];

	@HostListener('contextmenu', ['$event']) contextmenu($event: MouseEvent) {
		$event.preventDefault();
	}

	constructor(public host: ElementRef, protected communicators: ImageryCommunicatorService, protected store$: Store<any>) {
	}

	calcBoundingRect(id) {
		const { feature } = this.annotations.idToEntity.get(id);
		return this.annotations.getFeatureBoundingRect(feature);
	}

	getFeatureProps(id) {
		const { originalEntity: { featureJson: { properties } } } = this.annotations.idToEntity.get(id);
		return properties;
	}

	initData() {
		this.selection = [];
		this.hoverFeatureId = '';
	}

	ngOnInit() {
		this.communicators.instanceCreated.pipe(
			filter(({ id }) => id === this.mapId),
			tap(() => {
				this.communicator = this.communicators.provide(this.mapId);
				this.annotations = this.communicator.getPlugin(AnnotationsVisualizer);
				if (this.annotations) {
					this.subscribeVisualizerEvents();
				} else {
					this.unSubscribeVisualizerEvents();
				}

				this.subscribers.push(this.communicator.mapInstanceChanged.subscribe((mapInstanceChanged: IMapInstanceChanged) => {
					this.unSubscribeVisualizerEvents();
					this.initData();
					this.annotations = this.communicator.getPlugin(AnnotationsVisualizer);
					if (this.annotations) {
						this.subscribeVisualizerEvents();
					}
				}));
			}),
			take(1)
		).subscribe();
	}

	subscribeVisualizerEvents() {
		this.annotationsSubscribers.push(
			this.annotations.events.onHover.subscribe((hoverFeatureId: string) => {
				this.hoverFeatureId = hoverFeatureId;
			}),
			this.annotations.events.onSelect.subscribe((selected: string[]) => {
					this.selection = selected;
					this.selectedTab = this.selection.reduce((prev, id) => ({
						...prev,
						[id]: this.selectedTab[id]
					}), {});
				}
			)
		);
	}

	unSubscribeVisualizerEvents() {
		if (this.annotationsSubscribers) {
			this.annotationsSubscribers.forEach((subscriber) => subscriber.unsubscribe());
			this.annotationsSubscribers = [];
		}
	}

	ngOnDestroy(): void {
		if (this.subscribers) {
			this.subscribers.forEach((subscriber) => subscriber.unsubscribe());
			delete this.subscribers;
		}
		this.unSubscribeVisualizerEvents();
	}

	getType(): string {
		return '';
	}
}
