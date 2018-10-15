import { IVisualizerStateStyle } from '@ansyn/core';

export const VisualizersConfig = 'visualizersConfig';

export interface IVisualizersConfig {
	[key: string]: Partial<IVisualizerStateStyle>
}
