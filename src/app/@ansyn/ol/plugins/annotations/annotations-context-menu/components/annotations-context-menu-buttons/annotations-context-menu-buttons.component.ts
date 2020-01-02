import { AfterViewInit, Component, ElementRef, HostBinding, Input, OnDestroy, OnInit } from '@angular/core';
import { AnnotationsVisualizer } from '../../../annotations.visualizer';
import { AnnotationsContextmenuTabs } from '../annotation-context-menu/annotation-context-menu.component';
import * as SVG from '../annotation-context-menu/icons-svg';
import { IStyleWeight } from '../annotations-weight/annotations-weight.component';
import { IVisualizerEntity } from '@ansyn/imagery';
import { AnnotationMode } from '../../../annotations.model';

interface IFeatureProperties extends IVisualizerEntity {
	mode: AnnotationMode
}

@Component({
	selector: 'ansyn-annotations-context-menu-buttons',
	templateUrl: './annotations-context-menu-buttons.component.html',
	styleUrls: ['./annotations-context-menu-buttons.component.less']
})
export class AnnotationsContextMenuButtonsComponent implements OnInit, AfterViewInit, OnDestroy {
	@Input() annotations: AnnotationsVisualizer;
	@Input() featureId: string;
	@Input() selectedTab: { [id: string]: AnnotationsContextmenuTabs } = {};

	@HostBinding('style.right.px') right = 0;
	@HostBinding('style.top.px') top = 0;

	SVGICON = SVG;
	Tabs = AnnotationsContextmenuTabs;

	isFeatureNonEditable: boolean;
	featureProps: IFeatureProperties;
	timerId: number;
	imageryElement: Element;

	constructor(protected myElement: ElementRef) {
	}

	ngOnInit() {
		const feature = this.annotations.getJsonFeatureById(this.featureId);
		this.isFeatureNonEditable = feature && feature.properties.isNonEditable;
		this.featureProps = this.getFeatureProps() as IFeatureProperties;
	}

	ngAfterViewInit(): void {
		this.imageryElement = (this.myElement.nativeElement as HTMLElement).closest('.imagery');
		this.timerId = window.setInterval(this.calcPositionToStayInsideImagery.bind(this), 300);
	}

	ngOnDestroy(): void {
		window.clearInterval(this.timerId);
	}

	calcPositionToStayInsideImagery() {
		const myRect = this.myElement.nativeElement.getBoundingClientRect();
		const imageryRect = this.imageryElement.getBoundingClientRect() as DOMRect;

		const deltaForRightEdge = myRect.right - imageryRect.right;
		const deltaForLeftEdge = myRect.left - imageryRect.left;
		if (deltaForRightEdge > 0) {
			this.right += deltaForRightEdge;
		} else if (deltaForLeftEdge < 0) {
			this.right += deltaForLeftEdge;
		} else if (deltaForRightEdge !== 0 && deltaForLeftEdge !== 0) {
			this.right = 0;
		}

		const deltaForBottomEdge = myRect.bottom - imageryRect.bottom;
		const deltaForTopEdge = imageryRect.top - myRect.top;
		if (deltaForBottomEdge > 0) {
			this.top -= deltaForBottomEdge;
		} else if (deltaForTopEdge > 0) {
			this.top += deltaForTopEdge;
		} else if (deltaForTopEdge !== 0 && deltaForBottomEdge !== 0) {
			this.top = 0;
		}
	}

	toggleEditMode() {
		this.selectedTab = { ...this.selectedTab, [this.featureId]: null };
		const currentFeatureId = this.annotations.currentAnnotationEdit && this.annotations.currentAnnotationEdit.originalFeature;
		const enable = !(currentFeatureId && currentFeatureId.getId() === this.featureId);
		this.annotations.setEditAnnotationMode(this.featureId, enable);
	}

	getFeatureProps() {
		const { originalEntity: { featureJson: { properties } } } = this.annotations.idToEntity.get(this.featureId);
		return properties;
	}

	toggleMeasures() {
		const { showMeasures } = this.getFeatureProps();
		this.annotations.updateFeature(this.featureId, { showMeasures: !showMeasures });
	}

	selectTab(tab: AnnotationsContextmenuTabs) {
		this.selectedTab = {
			...this.selectedTab,
			[this.featureId]: this.selectedTab[this.featureId] === tab ? null : tab
		};
		this.annotations.clearAnnotationEditMode();
	}

	updateLabel(text) {
		this.annotations.updateFeature(this.featureId, { label: { text } });
	}

	updateLabelSize(labelSize) {
		this.annotations.updateFeature(this.featureId, { labelSize });
	}

	selectLineWidth(s: IStyleWeight, featureId: string) {
		const { style } = this.getFeatureProps();
		const updateStyle = {
			...style,
			initial: {
				...style.initial,
				'stroke-width': s.width,
				'stroke-dasharray': s.dash
			}
		};

		this.annotations.updateFeature(featureId, { style: updateStyle });
	}

	colorChange($event: [{ label: 'stroke' | 'fill' | 'marker-color', event: string }]) {
		const { style } = this.getFeatureProps();
		const updatedStyle = {
			...style,
			initial: {
				...style.initial,
			}
		};
		$event.forEach((entity) => {
			updatedStyle.initial[entity.label] = entity.event;
		});
		this.annotations.updateFeature(this.featureId, { style: updatedStyle });
	}

	activeChange($event: { label: 'stroke' | 'fill', event: string }) {
		let opacity = { stroke: 1, fill: 0.4 };
		const { style } = this.getFeatureProps();
		const updatedStyle = {
			...style,
			initial: {
				...style.initial,
				[`${ $event.label }-opacity`]: $event.event ? opacity[$event.label] : 0
			}
		};
		this.annotations.updateFeature(this.featureId, { style: updatedStyle });
	}

	removeFeature() {
		this.annotations.removeFeature(this.featureId);
	}

}
