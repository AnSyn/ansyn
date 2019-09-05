import * as turf from '@turf/turf';
import { getPolygonIntersectionRatioWithMultiPolygon } from './geo';

describe('geo utils', () => {
	// Small
	const extent1 = <GeoJSON.Polygon>turf.geometry('Polygon', [[
		[-74.30634782, 40.70691754],
		[-74.30634782, 40.56996158],
		[-74.09476401, 40.56996158],
		[-74.09476401, 40.70691754],
		[-74.30634782, 40.70691754]
	]]);

	const polygon1: GeoJSON.MultiPolygon = {
		'type': 'MultiPolygon',
		'coordinates': [extent1.coordinates]
	};

	// Big
	const extent2 = <GeoJSON.Polygon>turf.geometry('Polygon', [[
		[-108.6680662842075, 55.28962163640938],
		[-108.6680662842075, 22.089029254245375],
		[-39.48410696517823, 22.089029254245375],
		[-39.48410696517823, 55.28962163640938],
		[-108.6680662842075, 55.28962163640938]
	]]);

	const polygon2: GeoJSON.MultiPolygon = {
		'type': 'MultiPolygon',
		'coordinates': [extent2.coordinates]
	};

	describe('getPolygonIntersectionRatioWithMultiPolygon', () => {
		it('should extent intersection area be', function () {
			expect(getPolygonIntersectionRatioWithMultiPolygon(extent1, polygon2)).toBeGreaterThanOrEqual(1);
		});

		it('should extent intersection area be', function () {
			expect(getPolygonIntersectionRatioWithMultiPolygon(extent2, polygon1)).toBeLessThan(0.0001);
		});
	});
});
