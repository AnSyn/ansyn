import { InjectionToken } from '@angular/core';
import { VisualizerStateStyle } from '@ansyn/imagery/model/visualizer-state';

export const VisualizersConfig: InjectionToken<any> = new InjectionToken('visualizers-config');

export interface IVisualizersConfig {
	[ key: string ]: Partial<VisualizerStateStyle>
}
