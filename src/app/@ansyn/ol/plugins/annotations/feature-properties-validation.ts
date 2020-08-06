import { cloneDeep } from "lodash";
import { Feature } from "geojson";
import { MarkerSize } from "@ansyn/imagery";

export function validateFeatureProperties(feature: Feature<any>): Feature<any> {
	const featureJson = cloneDeep(feature);
	const { id, style, label, labelSize, icon, showMeasures, showArea, undeletable, mode, labelTranslateOn } = featureJson.properties;
	const { opacity, initial } = !!style ? style :  { opacity: null, initial: null };

	featureJson.properties = {
		id: (!!id && typeof id === 'string') ? id : '',
		labelSize: (!!labelSize && typeof labelSize === 'number') ? labelSize : 28,
		icon: (!!icon && typeof icon === 'string') ? icon : '',
		showMeasures: typeof showMeasures === 'boolean' ? showMeasures : false,
		showArea: typeof showArea === 'boolean' ? showArea : false,
		undeletable: typeof undeletable === 'boolean' ? undeletable : false,
		mode: (!!mode && typeof mode === 'string') ? mode : '',
		label: {
			text: (!!label && !!label.text && typeof label.text === 'string') ? label.text : '',
			geometry: (!!label && !!label.geometry) ? label.geometry : null
		},
		style: {
			opacity: !!opacity ? opacity : 1,
			initial: {
				stroke: (!!initial && !!initial.stroke && typeof initial.stroke === 'string') ? initial.stroke : '#27b2cfe6',
				'stroke-width': (!!initial && !!initial['stroke-width'] && typeof initial['stroke-width'] === 'number') ? initial['stroke-width'] : 1,
				fill: (!!initial && !!initial.fill && typeof initial.fill === 'string') ? initial.fill : 'white',
				'fill-opacity': (!!initial && !!initial['fill-opacity'] && typeof initial['fill-opacity'] === 'number') ? initial['fill-opacity'] : 0.4,
				'stroke-opacity': (!!initial && !!initial['stroke-opacity'] && typeof initial['stroke-opacity'] === 'number') ? initial['stroke-opacity'] : 1,
				'stroke-dasharray': (!!initial && !!initial['stroke-dasharray'] && typeof initial['stroke-dasharray'] === 'number') ? initial['stroke-dasharray'] : 0,
				'marker-size': (!!initial && !!initial['marker-size'] && typeof initial['marker-size'] === 'string') ? initial['marker-size'] : MarkerSize.medium,
				'marker-color': (!!initial && !!initial['marker-color'] && typeof initial['marker-color'] === 'string') ? initial['marker-color'] : `#ffffff`,
				label: {
					overflow: (!!initial && !!initial.label && !!initial.label.overflow && typeof initial.label.overflow === 'boolean') ? initial.label.overflow : true,
					stroke: (!!initial && !!initial.label && !!initial.label.stroke && typeof initial.label.stroke === 'string') ? initial.label.stroke : '#000',
					fill: (!!initial && !!initial.label && !!initial.label.fill && typeof initial.label.fill === 'string') ? initial.label.fill : 'white',
					offsetY: (!!initial && !!initial.label && !!initial.label.offsetY && typeof initial.label.offsetY === 'number') ? initial.label.offsetY : 30
				}
			}
		},
		labelTranslateOn: typeof labelTranslateOn === 'boolean' ? labelTranslateOn : false
	}

	return featureJson;
}
