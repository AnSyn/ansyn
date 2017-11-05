import { EntitiesVisualizer } from './entities-visualizer';
import Feature from 'ol/feature';
import Icon from 'ol/style/icon';
import Style from 'ol/style/style';

export const MouseShadowVisualizerType = 'MouseShadowVisualizer';

export class MouseShadowVisualizer extends EntitiesVisualizer {
	_iconSrc: Style;
	// constructor(iconPath: string, args: any) {
	constructor(args: any) {
		super(MouseShadowVisualizerType, args);
		// set icon
		this._iconSrc = new Style({
			image: new Icon({
				scale: 1,
				src: '/assets/icons/tools/mouse-shadow.svg'
			}),
			zIndex: 200
		});
	}

	featureStyle(feature: Feature, resolution) {
		return this._iconSrc;
	}
}
