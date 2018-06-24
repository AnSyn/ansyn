import { VisualizerStyle } from './visualizer-style';

export interface VisualizerStateStyle {
	opacity: number;
	colors?: {
		active: string,
		inactive: string,
		display: string,
		favorite: string
	},
	initial?: VisualizerStyle;
	hover?: Partial<VisualizerStyle>;

	entities?: {
		[key: string]: Partial<VisualizerStyle>;
	};
}

export const VisualizerStates = {
	INITIAL: 'initial',
	HOVER: 'hover'
};

