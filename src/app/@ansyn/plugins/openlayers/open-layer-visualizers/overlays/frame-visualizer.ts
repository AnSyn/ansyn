import { EntitiesVisualizer } from '../entities-visualizer';
import { VisualizerStateStyle } from '../models/visualizer-state';
import { Observable } from 'rxjs/Observable';
import { Inject, Injectable } from '@angular/core';
import { IVisualizersConfig, VisualizersConfig } from '@ansyn/core/tokens/visualizers-config.token';
@Injectable()
export class FrameVisualizer extends EntitiesVisualizer {
	public markups: any[] = [];
	public isActive = false;

	constructor(@Inject(VisualizersConfig) config: IVisualizersConfig) {
		super(config[FrameVisualizer.name]);
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
				delete (<any>features[0]).styleCache;
				this.source.refresh();
			}
		}
		return;
	}

	onResetView(): Observable<boolean> {
		this.clearEntities();
		this.initLayers();
		return Observable.of(true);
	}
}
