import { IVisualizerStateStyle } from './visualizers/visualizer-state';

export const VisualizersConfig = 'visualizersConfig';

export interface IVisualizersConfig {
	[key: string]: Partial<IVisualizerStateStyle>
}
