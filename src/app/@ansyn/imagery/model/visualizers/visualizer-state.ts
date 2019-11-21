import { IVisualizerStyle } from './visualizer-style';

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
