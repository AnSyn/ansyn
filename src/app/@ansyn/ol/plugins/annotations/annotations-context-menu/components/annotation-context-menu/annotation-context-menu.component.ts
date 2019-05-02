import { Component, ElementRef, HostBinding, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { filter, take, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { CommunicatorEntity, ImageryCommunicatorService, IMapSettings } from '@ansyn/imagery';
import { AnnotationsVisualizer } from '../../../annotations.visualizer';
import {
	AnnotationInteraction,
	IAnnotationsSelectionEventData, IIOnHoverEventData,
	IOnHoverEvent,
	IOnSelectEvent, IOnSelectEventData
} from '../../../annotations.model';

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

	openMenus: IOnSelectEventData;
	openMenusArray: IAnnotationsSelectionEventData[];
	hoverEventData: IIOnHoverEventData;

	@Input() mapState: IMapSettings;
	@HostBinding('attr.tabindex') tabindex = 0;

	@AutoSubscription
	onSelect$ = () => this.annotations.events.onSelect.pipe(
		filter((payload) => payload.mapId === this.mapState.id),
		tap((payload: IOnSelectEvent) => {
			this.openMenus = payload.multi ? (
				Object.entries(payload.data).reduce((prev, [key, value]) => {
					const { [key]: feat, ...rest } = prev;
					return feat ? rest : ({  ...prev, [key]: value  })
				}, this.openMenus)
			) : payload.data;
			this.openMenusArray = Object.values(this.openMenus)
		})
	);

	@AutoSubscription
	onHover$ = () => this.annotations.events.onHover.pipe(
		filter((payload) => payload.mapId === this.mapState.id),
		tap((payload: IOnHoverEvent) => this.hoverEventData = payload.data)
	);

	@HostListener('contextmenu', ['$event']) contextmenu($event: MouseEvent) {
		$event.preventDefault();
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
		// this.clickMenuProps = null;
		// this.selectedTab = null;
	}

	ngOnDestroy(): void {
	}

	removeFeature(featureId) {
		this.annotations.removeFeature(featureId);
		this.annotations.events.onSelect.next({
			mapId: this.mapState.id,
			multi: true,
			data: { [featureId]: { featureId } }
		})
	}

	selectTab(id: string, tab: AnnotationsContextmenuTabs) {
		this.selectedTab = { ...this.selectedTab, [id]: this.selectedTab[id] === tab ? null : tab };
	}

	toggleMeasures() {
	// 	const { featureId } = this.clickMenuProps;
	// 	const showMeasures = !this.clickMenuProps.showMeasures;
	// 	this.annotations.updateFeature(featureId, { showMeasures });
	// 	this.clickMenuProps.showMeasures = showMeasures;
	}

	selectLineWidth(w: number, menuProps: IAnnotationsSelectionEventData) {
		const { featureId, style } = menuProps;
		const updateStyle = {
			...style,
			initial: {
				...style.initial,
				'stroke-width': w
			}
		};

		this.annotations.updateFeature(featureId, { style: updateStyle });
		menuProps.style = style;
	}

	activeChange($event: { label: 'stroke' | 'fill', event: string }, menuProps: IAnnotationsSelectionEventData) {
		let opacity = { stroke: 1, fill: 0.4 };
		const { featureId, style } = menuProps;
		const updatedStyle = {
			...style,
			initial: {
				...style.initial,
				[`${$event.label}-opacity`]: $event.event ? opacity[$event.label] : 0
			}
		};
		this.annotations.updateFeature(featureId, { style: updatedStyle });
		menuProps.style = style;
	}

	colorChange($event: { label: 'stroke' | 'fill', event: string }, menuProps: IAnnotationsSelectionEventData) {
		const { featureId, style } = menuProps;
		const updateStyle = {
			...style,
			initial: {
				...style.initial,
				[$event.label]: $event.event
			}
		};
		this.annotations.updateFeature(featureId, { style: updateStyle });
		menuProps.style = style;
	}

	updateLabel(label, menuProps) {
		const { featureId } = menuProps;
		this.annotations.updateFeature(featureId, { label });
		menuProps.label = label
	}
}
