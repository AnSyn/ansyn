import { IVisualizerStateStyle } from './visualizer-state';
import { Feature } from 'geojson';

export interface IVisualizerEntity {
	id: string;
	label?: string;
	translateLabel?: {geometry: any, projection: any};
	featureJson: Feature<any>;
	icon?: any;
	type?: string;
	style?: Partial<IVisualizerStateStyle>;
	showMeasures?: boolean;
	undeletable?: boolean;
	editMode?: boolean;
}
