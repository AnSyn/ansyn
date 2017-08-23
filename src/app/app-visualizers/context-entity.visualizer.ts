import { EntitiesVisualizer } from '@ansyn/open-layer-visualizers/entities-visualizer';
import Feature from 'ol/feature';
import Icon from 'ol/style/icon';
import Fill from 'ol/style/fill';
import Style from 'ol/style/style';
import Stroke from 'ol/style/stroke';

import Point from 'ol/geom/point';
import Circle from 'ol/geom/circle';

import Geometry from 'ol/geom/geometry';
import Extent from 'ol/extent';
import Polygon from 'ol/geom/polygon';
import MultiPolygon from 'ol/geom/multipolygon';

export const ContextEntityVisualizerType = 'ContextEntityVisualizer';

export class ContextEntityVisualizer extends EntitiesVisualizer {

	private iconStyle: Style;

	constructor(args: any) {
		super(ContextEntityVisualizerType, args);

		this.iconStyle = new Icon({
			scale: 1,
			src: '/assets/icons/map/entity-marker.svg'
		});
	}

	featureStyle(feature: Feature, resolution) {
		const featureId = feature.getId();

		let style = this._styleCache[featureId];
		if (!style) {
			style = [
				new Style({
					stroke: new Stroke({
						color: this.strokeColor,
						width: 3
					}),
					fill: new Fill({
						color: this.fillColor
					})
					//,add text here
				}),new Style({
					image: this.iconStyle,
					geometry: this.getGeometry.bind(this)
				})
			];
			this._styleCache[featureId] = style;
		}
		return style;
	}

	private getGeometry(originalFeature) {
		const point = this.getPointGeometry(originalFeature.getGeometry());
		return point;
	}

	private getPointGeometry(geom: Geometry): Point {
		let result: Point = null;
		const geomType = geom.getType();
		if (geomType === 'Point') {
			result = <Point>geom;
		} else if (geomType === 'Polygon') {
			const polygonGeom = <Polygon>geom;
			result = polygonGeom.getInteriorPoint();
		} else if (geomType === 'MultiPolygon') {
			const multyPolygonGeom = <MultiPolygon>geom;
			const polygonGeom = <Polygon>multyPolygonGeom.getPolygon(0);
			result = polygonGeom.getInteriorPoint();
		} else if (geomType === 'Circle') {
			const circleGeom = <Circle>geom;
			const geomCenter = circleGeom.getCenter();
			result = new Point(geomCenter);
		}
		else {
			// TODO: not accurate as getInteriorPoint
			const geomExtent = geom.getExtent();
			const geomCenter = Extent.getCenter(geomExtent);
			result = new Point(geomCenter);
		}
		return result;
	}
}
