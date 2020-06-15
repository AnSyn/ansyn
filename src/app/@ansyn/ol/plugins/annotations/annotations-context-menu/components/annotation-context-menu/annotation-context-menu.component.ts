import { Component, ElementRef, HostBinding, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { CommunicatorEntity, ImageryCommunicatorService, IMapInstanceChanged } from '@ansyn/imagery';
import { filter, take, tap } from 'rxjs/operators';
import { AnnotationsVisualizer } from '../../../annotations.visualizer';
import { IFeatureIdentifier } from '../../../../entities-visualizer';

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
export class AnnotationContextMenuComponent implements OnInit, OnDestroy {
	annotations: AnnotationsVisualizer[];
	communicator: CommunicatorEntity;
	selectedTab: { [id: string]: AnnotationsContextmenuTabs } = {};

	selection: string[];
	hoverFeatureId: string;

	@Input() mapId: string;
	@HostBinding('attr.tabindex') tabindex = 0;

	subscribers = [];
	annotationsSubscribers = [];

	@HostListener('contextmenu', ['$event']) contextmenu($event: MouseEvent) {
		$event.preventDefault();
	}

	constructor(public host: ElementRef, protected communicators: ImageryCommunicatorService) {
	}

	calcBoundingRect(id) {
		let boundingRect;
		for (let i = 0; i < this.annotations.length; i++) {
			const entity = this.annotations[i].idToEntity.get(id);
			if (entity) {
				boundingRect = this.annotations[i].getFeatureBoundingRect(entity.feature);
				break;
			}
		}
		return boundingRect;
	}

	getFeatureProps(id) {
		const entity = this.getEntitiy(id);
			if (entity) {
				const { originalEntity: { featureJson: { properties } } } = entity;
				return properties;
			}
		return undefined;
	}

	getAnnotationVisById(featureId) {
		for (let i = 0; i < this.annotations.length; i++) {
			if (this.annotations[i].idToEntity.has(featureId)) {
				return this.annotations[i];
			}
		}
		return undefined;
	}

	getEntitiy(featureId): IFeatureIdentifier {
		if (this.annotations && this.annotations.length > 0) {
			for (let i = 0; i < this.annotations.length; i++) {
				if (this.annotations[i].idToEntity.has(featureId)) {
					return this.annotations[i].idToEntity.get(featureId);
				}
			}
		}
		return undefined
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
				this.annotations = this.getAnnotationsVisualiers();
				if (this.annotations && this.annotations.length > 0) {
					this.subscribeVisualizerEvents();
				} else {
					this.unSubscribeVisualizerEvents();
				}

				this.subscribers.push(this.communicator.mapInstanceChanged.subscribe((mapInstanceChanged: IMapInstanceChanged) => {
					this.unSubscribeVisualizerEvents();
					this.initData();
					this.annotations = this.getAnnotationsVisualiers();
					if (this.annotations && this.annotations.length > 0) {
						this.subscribeVisualizerEvents();
					}
				}));
			}),
			take(1)
		).subscribe();
	}

	getAnnotationsVisualiers(): AnnotationsVisualizer[] {
		const annotations = this.communicator.plugins.filter((plugin) => plugin instanceof AnnotationsVisualizer);
		return annotations;
	}

	subscribeVisualizerEvents() {
		this.annotations.forEach((annotationVis) => {
			this.annotationsSubscribers.push(
				annotationVis.events.onHover.subscribe((hoverFeatureId: string) => {
					this.hoverFeatureId = hoverFeatureId;
				}),
				annotationVis.events.onSelect.subscribe((selected: string[]) => {
						this.selection = selected;
						this.selectedTab = this.selection.reduce((prev, id) => ({
							...prev,
							[id]: this.selectedTab[id]
						}), {});
					}
				)
			);
		});
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
