import { Feature } from 'geojson';

export interface IVisualizerEntity {
	id: string;
	featureJson: Feature<any>;
}
