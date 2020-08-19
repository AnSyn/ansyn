import { AfterViewInit, Component, ElementRef, HostBinding, Input, OnInit, Inject } from '@angular/core';
import { AnnotationsVisualizer } from '../../../annotations.visualizer';
import { AnnotationsContextmenuTabs } from '../annotation-context-menu/annotation-context-menu.component';
import * as SVG from '../annotation-context-menu/icons-svg';
import { IStyleWeight } from '../annotations-weight/annotations-weight.component';
import { IVisualizerEntity, StayInImageryService, IVisualizerAttributes, getOpacityFromColor } from '@ansyn/imagery';
import { AnnotationMode } from '../../../annotations.model';
import { AttributeBase } from '../../models/attribute-base';
import { AttributesService } from '../../services/attributes.service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { OL_PLUGINS_CONFIG, IOLPluginsConfig } from '../../../../plugins.config';
import { LoggerService } from '../../../../../../ansyn/modules/core/services/logger.service';

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

	attributes$: Observable<AttributeBase<any>[]>;
	isMetadataEnabled: boolean;

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
		protected stayInImageryService: StayInImageryService,
		protected loggerService: LoggerService,
		private attributesService: AttributesService,
		@Inject(OL_PLUGINS_CONFIG) private olPluginsConfig: IOLPluginsConfig
	) {
	}

	ngOnInit() {
		const feature = this.annotations.getJsonFeatureById(this.featureId);
		this.isFeatureNonEditable = feature && feature.properties.isNonEditable;
		this.featureProps = this.getFeatureProps() as IFeatureProperties;
		this.attributes$ = this.attributesService.getAttributes().pipe(
			tap((attributes) => {
				const featureProps = this.getFeatureProps();
				if (!!featureProps.attributes) {
					this.updateAttributesValues(featureProps.attributes, attributes);
				}
			})
		);

		this.isMetadataEnabled =
			(!!this.olPluginsConfig && !!this.olPluginsConfig.AnnotationsContextMenu) ? this.olPluginsConfig.AnnotationsContextMenu.metadataActive : false;
	}

	ngAfterViewInit(): void {
		this.stayInImageryService.init(this.myElement.nativeElement);
	}

	toggleEditMode() {
		this.selectedTab = { ...this.selectedTab, [this.featureId]: null };
		const currentFeatureId = this.annotations.currentAnnotationEdit && this.annotations.currentAnnotationEdit.originalFeature;
		const enable = !(currentFeatureId && currentFeatureId.getId() === this.featureId);
		this.loggerService.info(`${enable ? 'Enter' : 'Exit'} annotation edit mode`, 'Annotations', 'TOGGLE_ANNOTATION_EDIT_MODE');
		this.annotations.setEditAnnotationMode(this.featureId, enable);
	}

	getFeatureProps() {
		const { originalEntity: { featureJson: { properties } } } = this.annotations.idToEntity.get(this.featureId);
		return properties;
	}

	toggleMeasures() {
		const { showMeasures } = this.getFeatureProps();
		this.loggerService.info(`${showMeasures ? 'Hiding' : 'Showing'} annotation measures`, 'Annotations', 'TOGGLE_ANNOTATION_MEASURES');
		this.annotations.updateFeature(this.featureId, { showMeasures: !showMeasures });
	}

	toggleArea() {
		const { showArea } = this.getFeatureProps();
		this.loggerService.info(`${showArea ? 'Hiding' : 'Showing'} annotation area`, 'Annotations', 'TOGGLE_ANNOTATION_AREA');
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
		this.loggerService.info(`Changing annotation label to ${text}`, 'Annotations', 'SET_ANNOTATION_LINE_WIDTH');
		this.annotations.updateFeature(this.featureId, { label: { text } });
	}

	updateLabelSize(labelSize) {
		this.loggerService.info(`Changing annotation label size`, 'Annotations', 'SET_ANNOTATION_LABEL_SIZE');
		this.annotations.updateFeature(this.featureId, { labelSize });
	}

	selectLineWidth(s: IStyleWeight, featureId: string) {
		this.loggerService.info(`Changing annotation line width`, 'Annotations', 'SET_ANNOTATION_LINE_WIDTH');
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
		this.loggerService.info(`Changing annotation colors`, 'Annotations', 'SET_ANNOTATION_COLORS');
		const { style } = this.getFeatureProps();
		const updatedStyle = {
			...style,
			initial: {
				...style.initial,
			}
		};

		$event.forEach((entity) => {
			updatedStyle.initial[entity.label] = entity.event;

			let opacityProp: string;
			switch (entity.label) {
				case 'fill':
					opacityProp = 'fill-opacity';
					break;
				case 'stroke':
					opacityProp = 'stroke-opacity';
					break;
				default:
					opacityProp = null;
			}

			if (opacityProp) {
				updatedStyle.initial[opacityProp] = getOpacityFromColor(entity.event);
			}
		});
		this.annotations.updateFeature(this.featureId, { style: updatedStyle });
	}

	activeChange($event: { label: 'stroke' | 'fill', event: string }) {
		this.loggerService.info(`Changing annotation active colors`, 'Annotations', 'SET_ANNOTATION_ACTIVE_COLORS');
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
		this.loggerService.info(`Deleting annotation`, 'Annotations', 'DELETE_ANNOTATION');
		this.annotations.removeFeature(this.featureId);
	}

	onMetadataFormSubmit(attributes: AttributeBase<any>[]) {
		const attributesDictionary = {};
		attributes.forEach((att) => {
			attributesDictionary[att.key] = att.value;
		});
		this.annotations.updateFeature(this.featureId, { attributes: attributesDictionary });
	}
	private updateAttributesValues(newValues: IVisualizerAttributes, attributes: AttributeBase<any>[]) {
		attributes.forEach((attribute) => {
			Object.keys(newValues).forEach((key) => {
				if (key === attribute.key) {
					attribute.value = newValues[key];
				}
			});
		});
	}

}
