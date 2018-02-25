import { EntitiesVisualizer } from '../entities-visualizer';
import { VisualizerStateStyle } from '../models/visualizer-state';

export const FrameVisualizerType = 'FrameVisualizer';

export class FrameVisualizer extends EntitiesVisualizer {
	static type = FrameVisualizerType;
	public markups: any[] = [];
	public isActive = false;

	constructor(style: Partial<VisualizerStateStyle>) {
		super(FrameVisualizerType, style);
		this.updateStyle({
			opacity: 0.5,
			initial: {
				zIndex: 10,
				fill: null,
				stroke: {
					width: 3,
					color: this.getStroke.bind(this)
				}
			}
		});
	}

	getStroke() {
		return this.isActive ? this.visualizerStyle.colors.active : this.visualizerStyle.colors.inactive;
	}

	public purgeCache() {
		if (this.source) {
			const features = this.source.getFeatures();
			if (features && features[0]) {
				delete (<any>this.source.getFeatures()[0]).styleCache;
				this.source.refresh();
			}
		}
		return;
	}

}
