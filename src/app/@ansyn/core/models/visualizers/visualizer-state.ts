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

	entities?: {
		[key: string]: Partial<IVisualizerStyle>;
	};
}

export const VisualizerStates = {
	INITIAL: 'initial',
	HOVER: 'hover'
};

