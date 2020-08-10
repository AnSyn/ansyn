import { IVisualizerStyle, MarkerSize } from './visualizer-style';
import { cloneDeep } from 'lodash';
import { Feature } from 'geojson';

export const ANNOTATIONS_FILL_ALPHA = 0.4;
const ANNOTATIONS_INITIAL_STYLE: IVisualizerStyle = {
	stroke: '#27b2cfe6',
	'stroke-width': 1,
	fill: `white`,
	'fill-opacity': ANNOTATIONS_FILL_ALPHA,
	'stroke-opacity': 1,
	'stroke-dasharray': 0,
	'marker-size': MarkerSize.medium,
	'marker-color': `#ffffff`,
	label: {
		overflow: true,
		stroke: '#000',
		fill: 'white',
		offsetY: 30
	}
}

const ANNOTATIONS_FEATURE_INITIAL_PROPERTIES = {
	id: '',
	style: { opacity: 1, initial: { ...ANNOTATIONS_INITIAL_STYLE } },
	label: {
		text: '',
		geometry: null
	},
	labelSize: 28,
	icon: '',
	showMeasures: false,
	showArea: false,
	undeletable: false,
	mode: '',
	labelTranslateOn: false
}


export function getInitialAnnotationsFeatureProperties() {
	return cloneDeep(ANNOTATIONS_FEATURE_INITIAL_PROPERTIES);
}

export function getInitialAnnotationsFeatureStyle() {
	return cloneDeep(ANNOTATIONS_INITIAL_STYLE);
}

export function validateFeatureProperties(feature: Feature<any>): Feature<any> {
	const featureJson = cloneDeep(feature);
	const defaultProperties = getInitialAnnotationsFeatureProperties();
	const defaultStyle = defaultProperties.style;

	if (!featureJson.properties) {
		featureJson.properties = {};
	}

	const { id, style, label, labelSize, icon, showMeasures, showArea, undeletable, mode, labelTranslateOn } = featureJson.properties;
	const { opacity, initial } = !!style ? style :  { opacity: null, initial: null };

	featureJson.properties = {
		... featureJson.properties,
		id: (!!id && typeof id === 'string') ? id : defaultProperties.id,
		labelSize: (!!labelSize && typeof labelSize === 'number') ? labelSize : defaultProperties.labelSize,
		icon: (!!icon && typeof icon === 'string') ? icon : defaultProperties.icon,
		showMeasures: typeof showMeasures === 'boolean' ? showMeasures : defaultProperties.showMeasures,
		showArea: typeof showArea === 'boolean' ? showArea : defaultProperties.showArea,
		undeletable: typeof undeletable === 'boolean' ? undeletable : defaultProperties.undeletable,
		mode: (!!mode && typeof mode === 'string') ? mode : defaultProperties.mode,
		label: {
			text: (!!label && !!label.text && typeof label.text === 'string') ? label.text : defaultProperties.label.text,
			geometry: (!!label && !!label.geometry) ? label.geometry : defaultProperties.label.geometry
		},
		style: {
			opacity: !!opacity ? opacity : defaultStyle.opacity,
			initial: {
				stroke: (!!initial && !!initial.stroke && typeof initial.stroke === 'string') ? initial.stroke : defaultStyle.initial.stroke,
				'stroke-width': (!!initial && !!initial['stroke-width'] && typeof initial['stroke-width'] === 'number') ? initial['stroke-width'] : defaultStyle.initial['stroke-width'],
				fill: (!!initial && !!initial.fill && typeof initial.fill === 'string') ? initial.fill : defaultStyle.initial.fill,
				'fill-opacity': (!!initial && !!initial['fill-opacity'] && typeof initial['fill-opacity'] === 'number') ? initial['fill-opacity'] : defaultStyle.initial['fill-opacity'],
				'stroke-opacity': (!!initial && !!initial['stroke-opacity'] && typeof initial['stroke-opacity'] === 'number') ? initial['stroke-opacity'] : defaultStyle.initial['stroke-opacity'],
				'stroke-dasharray': (!!initial && !!initial['stroke-dasharray'] && typeof initial['stroke-dasharray'] === 'number') ? initial['stroke-dasharray'] : defaultStyle.initial['stroke-dasharray'],
				'marker-size': (!!initial && !!initial['marker-size'] && typeof initial['marker-size'] === 'string') ? initial['marker-size'] : defaultStyle.initial['marker-size'],
				'marker-color': (!!initial && !!initial['marker-color'] && typeof initial['marker-color'] === 'string') ? initial['marker-color'] : defaultStyle.initial['marker-color'],
				label: {
					overflow: (!!initial && !!initial.label && !!initial.label.overflow && typeof initial.label.overflow === 'boolean') ? initial.label.overflow : defaultStyle.initial.label.overflow,
					stroke: (!!initial && !!initial.label && !!initial.label.stroke && typeof initial.label.stroke === 'string') ? initial.label.stroke : defaultStyle.initial.label.stroke,
					fill: (!!initial && !!initial.label && !!initial.label.fill && typeof initial.label.fill === 'string') ? initial.label.fill : defaultStyle.initial.label.fill,
					offsetY: (!!initial && !!initial.label && !!initial.label.offsetY && typeof initial.label.offsetY === 'number') ? initial.label.offsetY : defaultStyle.initial.label.offsetY
				}
			}
		},
		labelTranslateOn: typeof labelTranslateOn === 'boolean' ? labelTranslateOn : defaultProperties.labelTranslateOn
	}

	return featureJson;
}
