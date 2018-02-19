import { EntitiesVisualizer } from '../entities-visualizer';
import { IMarkupEvent } from '@ansyn/imagery/model/imap-visualizer';
import { VisualizerStateStyle } from '../models/visualizer-state';
import Feature from 'ol/feature';
import { CoreConfig, ICoreConfig } from '@ansyn/core/models';
import { Inject } from '@angular/core';

export const FrameVisualizerType = 'FrameVisualizer';

export class FrameVisualizer extends EntitiesVisualizer {
	static type = FrameVisualizerType;
	public markups: any[] = [];

	constructor(style: Partial<VisualizerStateStyle>, @Inject(CoreConfig) public coreConfig: ICoreConfig) {
		super(FrameVisualizerType, style);

		this.updateStyle({
			opacity: 0.5,
			initial: {
				zIndex: 10,
				fill: null,
				stroke: {
					width: 3,
					color: this.getStrokeColor.bind(this)
				}
			}
		});
	}

	private getStrokeColor(feature: Feature) {
		const featureId = feature.getId();
		const markUp = this.markups.find(markup => markup.id === featureId);
		return (markUp && markUp.class) ? '#27b2cf' : '#d393e1';
		// return (markUp && markUp.class) ? this.coreConfig.colors.active : this.coreConfig.colors.inactive;
	}


	clearOneEntity(id) {
		this.idToEntity.delete(id);
		this.source.clear(true);

	}

	setMarkupFeatures(markups: IMarkupEvent) {
		this.markups = markups;

		if (this.source) {
			super.purgeCache();
			this.source.refresh();
		}
	}

}
