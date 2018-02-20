import { EntitiesVisualizer } from '../entities-visualizer';
import { VisualizerStateStyle } from '../models/visualizer-state';
import { CoreConfig, ICoreConfig } from '@ansyn/core/models';
import { Inject } from '@angular/core';

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
			delete (<any>this.source.getFeatures()[0]).styleCache;
			this.source.refresh();
		}
		return;
	}

}
