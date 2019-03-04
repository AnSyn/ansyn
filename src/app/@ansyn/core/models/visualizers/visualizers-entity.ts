import { IVisualizerStateStyle } from './visualizer-state';
import { Feature } from 'geojson';

export interface IVisualizerEntityTags  {
	[id: string]: { time: number, count: number, id: string}
}

export interface IVisualizerEntity {
	id: string;
	label?: string;
	featureJson: Feature<any>;
	state?: 'static' | 'activeDisplad';
	type?: string;
	style?: Partial<IVisualizerStateStyle>;
	showMeasures?: boolean;
	showLabel?: boolean;
	showCount?: boolean;
	tags?: { [id: string]: { time: number, count: number, id: string} };
}
