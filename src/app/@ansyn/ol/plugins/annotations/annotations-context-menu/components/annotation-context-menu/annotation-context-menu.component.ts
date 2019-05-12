import { Component, ElementRef, HostBinding, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { filter, take, tap } from 'rxjs/operators';
import { CommunicatorEntity, ImageryCommunicatorService, IMapSettings } from '@ansyn/imagery';
import { AnnotationsVisualizer } from '../../../annotations.visualizer';

enum AnnotationsContextmenuTabs {
	Colors,
	Weight,
	Label,
}

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
	annotations: AnnotationsVisualizer;
	communicator: CommunicatorEntity;
	Tabs = AnnotationsContextmenuTabs;
	selectedTab: { [id: string]: AnnotationsContextmenuTabs } = {};

	selection: string[];
	hoverFeatureId: string;

	@Input() mapId: string;
	@HostBinding('attr.tabindex') tabindex = 0;

	@AutoSubscription
	onSelect$ = () => this.annotations.events.onSelect.pipe(
		tap((selected: string[]) => {
			this.selection = selected;
			this.selectedTab = this.selection.reduce((prev, id) => ({
				...prev,
				[id]: this.selectedTab[id]
			}), {});

		})
	);

	@AutoSubscription
	onHover$ = () => this.annotations.events.onHover.pipe(
		tap((hoverFeatureId: string) => this.hoverFeatureId = hoverFeatureId)
	);

	@HostListener('contextmenu', ['$event']) contextmenu($event: MouseEvent) {
		$event.preventDefault();
	}

	constructor(public host: ElementRef, protected communicators: ImageryCommunicatorService) {
	}

	calcBoundingRect(id) {
		const { feature } = this.annotations.idToEntity.get(id);
		return this.annotations.getFeatureBoundingRect(feature);
	}

	getFeatureProps(id) {
		const { originalEntity: { featureJson: { properties } } } = this.annotations.idToEntity.get(id);
		return properties;
	}

	onInitMap() {
	}

	ngOnInit() {
		this.communicators.instanceCreated.pipe(
			filter(({ id }) => id === this.mapId),
			tap(() => {
				this.communicator = this.communicators.provide(this.mapId);
				this.annotations = this.communicator.getPlugin(AnnotationsVisualizer);
				this.onInitMap();
			}),
			take(1)
		).subscribe();
	}

	ngOnDestroy(): void {
	}

	removeFeature(featureId) {
		this.annotations.removeFeature(featureId);
		// this.annotations.events.onSelect.next({
		// 	mapId: this.mapState.id,
		// 	multi: true,
		// 	data: { [featureId]: { featureId } }
		// })
	}

	selectTab(id: string, tab: AnnotationsContextmenuTabs) {
		this.selectedTab = { ...this.selectedTab, [id]: this.selectedTab[id] === tab ? null : tab };
	}

	toggleMeasures(featureId) {
		const { showMeasures } = this.getFeatureProps(featureId);
		this.annotations.updateFeature(featureId, { showMeasures: !showMeasures });
	}

	selectLineWidth(w: number, featureId: string) {
		const { style } = this.getFeatureProps(featureId);
		const updateStyle = {
			...style,
			initial: {
				...style.initial,
				'stroke-width': w
			}
		};

		this.annotations.updateFeature(featureId, { style: updateStyle });
	}

	activeChange($event: { label: 'stroke' | 'fill', event: string }, featureId: string) {
		let opacity = { stroke: 1, fill: 0.4 };
		const { style } = this.getFeatureProps(featureId);
		const updatedStyle = {
			...style,
			initial: {
				...style.initial,
				[`${$event.label}-opacity`]: $event.event ? opacity[$event.label] : 0
			}
		};
		this.annotations.updateFeature(featureId, { style: updatedStyle });
	}

	colorChange($event: { label: 'stroke' | 'fill', event: string }, featureId: string) {
		const { style } = this.getFeatureProps(featureId);
		const updatedStyle = {
			...style,
			initial: {
				...style.initial,
				[$event.label]: $event.event
			}
		};
		this.annotations.updateFeature(featureId, { style: updatedStyle });
	}

	updateLabel(label, featureId: string) {
		this.annotations.updateFeature(featureId, { label });
	}
}
