import { IVisualizerStyle, MarkerSize } from './visualizer-style';

export interface IVisualizerStateStyle {
	opacity: number;
	colors?: {
		active: string,
		inactive: string,
		display: string,
		favorite: string
	},
	initial?: IVisualizerStyle;
	hover?: Partial<IVisualizerStyle>;
	minSimplifyVertexCountLimit?: number;
	entities?: {
		[key: string]: Partial<IVisualizerStyle>;
	};
	extra?: any;
}

export enum VisualizerStates {
	INITIAL = 'initial',
	HOVER = 'hover',
	ENTITIES = 'entities'
}

export const ANNOTATIONS_INITIAL_STYLE: IVisualizerStyle = {
	stroke: '#27b2cfe6',
	'stroke-width': 1,
	fill: `white`,
	'fill-opacity': 0.4,
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

export const ANNOTATIONS_FEATURE_INITIAL_PROPERTIES = {
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
	mode: ''
}
