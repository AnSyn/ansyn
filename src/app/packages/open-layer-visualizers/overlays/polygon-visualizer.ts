import { EntitiesVisualizer } from '../entities-visualizer';
import Select from 'ol/interaction/select';
import condition from 'ol/events/condition';
import Style from 'ol/style/style';
import Fill from 'ol/style/fill';
import Stroke from 'ol/style/stroke';
import { IMap } from '../../imagery/model/imap';

export const FootprintPolygonVisualizerType = 'FootprintPolygonVisualizer';

export const polygonStyles = {
	staticPolygon: new Style({
		stroke: new Stroke({
			color: '#bd0fe2',
			width: 5
		}),
		fill: undefined
	})

};
// rgba(255, 255, 255, 0.4)
export class FootprintPolygonVisualizer extends EntitiesVisualizer {

	constructor(args: any) {
		super(FootprintPolygonVisualizerType, args);
		this.fillColor = 'transparent';
		this.strokeColor = 'rgb(211, 147, 225)';
		this.containerLayerOpacity = 0.5;
	}

}
