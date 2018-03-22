import { EntitiesVisualizer } from './entities-visualizer';
import Feature from 'ol/feature';
import Icon from 'ol/style/icon';
import Style from 'ol/style/style';

export class IconVisualizer extends EntitiesVisualizer {
	_iconSrc: Style;

	// constructor(iconPath: string, args: any) {
	constructor(args: any) {
		super(args);
		// set icon
		this._iconSrc = new Style({
			image: new Icon({
				scale: 1,
				src: '/assets/pinpoint-indicator.svg'
			}),
			zIndex: 100
		});
	}

	featureStyle(feature: Feature, resolution) {
		return this._iconSrc;
	}
}
