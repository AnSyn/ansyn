import { EntitiesVisualizer } from '../entities-visualizer';
import MultiPolygon from 'ol/geom/multipolygon';
import Feature from 'ol/feature';
import { IMarkupEvent, IVisualizerEntity } from '@ansyn/imagery/model/imap-visualizer';
import { cloneDeep as _cloneDeep } from 'lodash';
import { VisualizerStateStyle } from '../models/visualizer-state';

export const FootprintPolylineVisualizerType = 'FootprintPolylineVisualizer';

export class FootprintPolylineVisualizer extends EntitiesVisualizer {
	static type = FootprintPolylineVisualizerType;

	markups: any[] = [];

	constructor(style: Partial<VisualizerStateStyle>) {
		super(FootprintPolylineVisualizerType, style);

		this.enableInteraction('pointMove');
		this.enableInteraction('doubleClick');

		// No access to `this` in super constructor
		this.updateStyle({
			opacity: 0.5,
			initial: {
				zIndex: this.getZIndex.bind(this),
				fill: null,
				stroke: {
					width: this.getStrokeWidth.bind(this),
					color: this.getStrokeColor.bind(this)
				}
			},
			hover: {
				zIndex: 4,
				fill: {
					color: 'rgba(255, 255, 255, 0.4)'
				},
				stroke: {
					width: 5
				}
			}
		});
	}

	private getMarkupClasses(featureId: string): string[] {
		return this.markups
			.filter(({ id }) => id === featureId)
			.map(mark => mark.class);
	}

	private propsByFeature(feature: Feature) {
		const classes = this.getMarkupClasses(feature.getId());

		const isFavorites = classes.includes('favorites');
		const isActive = classes.includes('active');
		const isDisplayed = classes.includes('displayed');

		return { isFavorites, isActive, isDisplayed };
	}

	private getZIndex(feature: Feature) {
		const { isActive, isFavorites } = this.propsByFeature(feature);

		return isActive ? 3 : isFavorites ? 2 : 1;
	}

	private getStrokeColor(feature: Feature) {
		const { isFavorites, isActive, isDisplayed } = this.propsByFeature(feature);

		if (isFavorites) {
			return 'yellow';
		}

		if (isActive) {
			return '#27b2cf';
		}

		if (isDisplayed) {
			return '#9524ad';
		}

		return '#d393e1';
	}

	private getStrokeWidth(feature: Feature) {
		const { isActive, isDisplayed } = this.propsByFeature(feature);

		if (isActive || isDisplayed) {
			return 5;
		}

		return 3;
	}

	addOrUpdateEntities(logicalEntities: IVisualizerEntity[]) {
		const conversion = this.convertPolygonToPolyline(logicalEntities);
		super.addOrUpdateEntities(conversion);
	}

	private convertPolygonToPolyline(logicalEntities: IVisualizerEntity[]): IVisualizerEntity[] {
		const clonedLogicalEntities = _cloneDeep(logicalEntities);
		clonedLogicalEntities
			.filter((entity: IVisualizerEntity) => entity.featureJson.geometry.type === 'MultiPolygon')
			.forEach((entity: IVisualizerEntity) => {
				let geometry: GeoJSON.MultiLineString = entity.featureJson.geometry;
				geometry.type = 'MultiLineString';
				geometry.coordinates = <any> geometry.coordinates[0];
			});
		return clonedLogicalEntities;
	}

	setMarkupFeatures(markups: IMarkupEvent) {
		this.markups = markups;
		this.hoverLayer.getSource().refresh();
		if (this.source) {
			this.source.refresh();
		}
	}
}
