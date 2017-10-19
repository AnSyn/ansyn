import { extentToPolygon, getFootprintIntersectionRatioInExtent, isExtentContainedInPolygon } from './calc-extent';

describe('calc-extent', () => {
	// Small
	const extent1: GeoJSON.Point[] = [
		{
			type: 'Point',
			coordinates: [-74.30634782, 40.70691754]
		}, {
			type: 'Point',
			coordinates: [-74.09476401, 40.56996158]
		}
	];

	const polygon1: GeoJSON.MultiPolygon = {
		'type': 'MultiPolygon',
		'coordinates': [extentToPolygon(extent1).geometry.coordinates]
	};

	// Big
	const extent2: GeoJSON.Point[] = [
		{
			type: 'Point',
			coordinates: [-108.6680662842075, 55.28962163640938]
		}, {
			type: 'Point',
			coordinates: [-39.48410696517823, 22.089029254245375]
		}
	];

	const polygon2: GeoJSON.MultiPolygon = {
		'type': 'MultiPolygon',
		'coordinates': [extentToPolygon(extent2).geometry.coordinates]
	};

	describe('calcGeoJSONExtent', () => {
		// TODO
	});

	describe('extentToPolygon', () => {
		it('should create a non intersecting polygon out of extent', function () {
			const extent: GeoJSON.Point[] = [
				{
					type: 'Point',
					coordinates: [0, 5]
				}, {
					type: 'Point',
					coordinates: [4, 1]
				}
			];
			const polygon = extentToPolygon(extent);

			expect(polygon.geometry.type).toBe('Polygon');
			expect(polygon.geometry.coordinates).toEqual([[[0, 5], [0, 1], [4, 1], [4, 5], [0, 5]]]);
		});
	});

	describe('isExtentContainedInPolygon', () => {
		it('should extent be in footprint', function () {
			expect(isExtentContainedInPolygon(extent1, polygon2)).toBe(true);
		});
		it('should extent not be in footprint', function () {
			expect(isExtentContainedInPolygon(extent2, polygon1)).toBe(false);
		});
	});

	describe('getFootprintIntersectionRatioInExtent', () => {
		it('should extent intersection area be', function () {
			expect(getFootprintIntersectionRatioInExtent(extent1, polygon2)).toBeGreaterThan(1);
		});

		it('should extent intersection area be', function () {
			expect(getFootprintIntersectionRatioInExtent(extent2, polygon1)).toBeLessThan(0.0001);
		});
	});
});
