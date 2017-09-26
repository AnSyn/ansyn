import { EntitiesVisualizer } from '../entities-visualizer';
import Feature from 'ol/feature';
import Icon from 'ol/style/icon';
import Style from 'ol/style/style';

export const GoToVisualizerType = 'GoToVisualizer';

export class GoToVisualizer extends EntitiesVisualizer {

	iconStyle: Style;


	constructor(args: any) {
		super(GoToVisualizerType, args);

		this.iconStyle = new Style({ image: new Icon({ scale: 1, src: '/assets/icons/tools/goto-map-marker.svg' }) });
	}

	featureStyle(feature: Feature, resolution) {
		return this.iconStyle;
	}

}
