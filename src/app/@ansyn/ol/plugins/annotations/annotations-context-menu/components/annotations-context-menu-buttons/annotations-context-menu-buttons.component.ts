import { Component, Input, OnInit } from '@angular/core';
import { AnnotationsVisualizer } from '../../../annotations.visualizer';
import { AnnotationsContextmenuTabs } from '../annotation-context-menu/annotation-context-menu.component';
import * as SVG from '../annotation-context-menu/icons-svg';
import { IStyleWeight } from '../annotations-weight/annotations-weight.component';

@Component({
	selector: 'ansyn-annotations-context-menu-buttons',
	templateUrl: './annotations-context-menu-buttons.component.html',
	styleUrls: ['./annotations-context-menu-buttons.component.less']
})
export class AnnotationsContextMenuButtonsComponent implements OnInit {
	@Input() annotations: AnnotationsVisualizer;
	@Input() featureId: string;
	@Input() selectedTab: { [id: string]: AnnotationsContextmenuTabs } = {};

	SVGICON = SVG;
	Tabs = AnnotationsContextmenuTabs;

	constructor() {
	}

	ngOnInit() {
	}

	isFeatureNonEditable(featureId: string) {
		const feature = this.annotations.getJsonFeatureById(featureId);
		return feature && feature.properties.isNonEditable;
	}

	toggleEditMode(featureId: any) {
		this.selectedTab = { ...this.selectedTab, [featureId]: null};
		const currentFeatureId = this.annotations.currentAnnotationEdit && this.annotations.currentAnnotationEdit.originalFeature;
		const enable = !(currentFeatureId && currentFeatureId.getId() === featureId);
		this.annotations.setEditAnnotationMode(featureId, enable);
	}

	getFeatureProps(id) {
		const { originalEntity: { featureJson: { properties } } } = this.annotations.idToEntity.get(id);
		return properties;
	}

	toggleMeasures(featureId) {
		const { showMeasures } = this.getFeatureProps(featureId);
		this.annotations.clearAnnotationEditMode();
		this.annotations.updateFeature(featureId, { showMeasures: !showMeasures });
	}

	selectTab(id: string, tab: AnnotationsContextmenuTabs) {
		this.selectedTab = { ...this.selectedTab, [id]: this.selectedTab[id] === tab ? null : tab };
		this.annotations.clearAnnotationEditMode();
	}

	updateLabel(text, featureId: string) {
		this.annotations.updateFeature(featureId, { label: {text} });
	}

	updateLabelSize(labelSize, featureId: string) {
		this.annotations.updateFeature(featureId, {labelSize});
	}

	selectLineWidth(s: IStyleWeight, featureId: string) {
		const { style } = this.getFeatureProps(featureId);
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

	colorChange($event: [{ label: 'stroke' | 'fill' | 'marker-color', event: string }], featureId: string) {
		const { style } = this.getFeatureProps(featureId);
		const updatedStyle = {
			...style,
			initial: {
				...style.initial,
			}
		};
		$event.forEach((entity) => {
			updatedStyle.initial[entity.label] = entity.event;
		});
		this.annotations.updateFeature(featureId, { style: updatedStyle });
	}

	activeChange($event: { label: 'stroke' | 'fill', event: string }, featureId: string) {
		let opacity = { stroke: 1, fill: 0.4 };
		const { style } = this.getFeatureProps(featureId);
		const updatedStyle = {
			...style,
			initial: {
				...style.initial,
				[`${ $event.label }-opacity`]: $event.event ? opacity[$event.label] : 0
			}
		};
		this.annotations.updateFeature(featureId, { style: updatedStyle });
	}

	removeFeature(featureId) {
		this.annotations.removeFeature(featureId);
	}

}
