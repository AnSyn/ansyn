import { AfterViewInit, Component, ElementRef, HostBinding, Input, OnInit } from '@angular/core';
import { AnnotationsVisualizer } from '../../../annotations.visualizer';
import { AnnotationsContextmenuTabs } from '../annotation-context-menu/annotation-context-menu.component';
import * as SVG from '../annotation-context-menu/icons-svg';
import { IStyleWeight } from '../annotations-weight/annotations-weight.component';
import { IVisualizerEntity, StayInImageryService } from '@ansyn/imagery';
import { AnnotationMode } from '../../../annotations.model';

interface IFeatureProperties extends IVisualizerEntity {
	mode: AnnotationMode
}

@Component({
	selector: 'ansyn-annotations-context-menu-buttons',
	templateUrl: './annotations-context-menu-buttons.component.html',
	styleUrls: ['./annotations-context-menu-buttons.component.less'],
	providers: [StayInImageryService]
})
export class AnnotationsContextMenuButtonsComponent implements OnInit, AfterViewInit {
	@Input() annotations: AnnotationsVisualizer;
	@Input() featureId: string;
	@Input() selectedTab: { [id: string]: AnnotationsContextmenuTabs } = {};

	@HostBinding('style.right.px')
	get right() {
		return this.stayInImageryService.moveLeft;
	}

	@HostBinding('style.top.px')
	get top() {
		return this.stayInImageryService.moveDown;
	}

	SVGICON = SVG;
	Tabs = AnnotationsContextmenuTabs;

	isFeatureNonEditable: boolean;
	featureProps: IFeatureProperties;

	constructor(
		protected myElement: ElementRef,
		protected stayInImageryService: StayInImageryService
	) {
	}

	ngOnInit() {
		const feature = this.annotations.getJsonFeatureById(this.featureId);
		this.isFeatureNonEditable = feature && feature.properties.isNonEditable;
		this.featureProps = this.getFeatureProps() as IFeatureProperties;
	}

	ngAfterViewInit(): void {
		this.stayInImageryService.init(this.myElement.nativeElement);
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

	toggleArea() {
		const { showArea } = this.getFeatureProps();
		this.annotations.updateFeature(this.featureId, { showArea: !showArea });
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
