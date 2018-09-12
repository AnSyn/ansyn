import { InjectionToken } from '@angular/core';
import { IVisualizerStateStyle } from '@ansyn/core';

export const VisualizersConfig: InjectionToken<any> = new InjectionToken('visualizers-config');

export interface IVisualizersConfig {
	[ key: string ]: Partial<IVisualizerStateStyle>
}
