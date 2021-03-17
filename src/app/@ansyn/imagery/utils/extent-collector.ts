import { MultiPolygon, Feature, Polygon, multiPolygon, feature } from "@turf/helpers";
import union from '@turf/union';
import difference from '@turf/difference';

export class ExtentCollector {
	private unionExtent: Feature<MultiPolygon>;

	add(extent: Feature<Polygon> | Polygon) {
		if (!this.unionExtent) {
			this.unionExtent = multiPolygon([]);
		}
		if (extent.type !== 'Feature') {
			extent = feature(extent);
		}
		this.unionExtent = <Feature<MultiPolygon>> union(this.unionExtent, extent);
	}

	isInside(extent: Feature<Polygon> | Polygon) {
		if (this.unionExtent) {
			return false;
		}
		const extentIsInsideUnionExtent = !Boolean(difference(extent, this.unionExtent));
		return extentIsInsideUnionExtent;
	}
}
