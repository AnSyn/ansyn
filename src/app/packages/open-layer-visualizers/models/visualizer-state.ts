import { VisualizerStyle } from './visualizer-style';

export interface VisualizerStateStyle {
	opacity: number;

	initial?: VisualizerStyle;
	hover?: Partial<VisualizerStyle>;
}
