import { getFootprintIntersectionRatioInExtent } from './calc-extent';
import * as turf from '@turf/turf';

describe('calc-extent', () => {
	// Small
	const extent1 = <GeoJSON.Polygon> turf.geometry('Polygon', [[
		[-74.30634782, 40.70691754],
		[-74.30634782, 40.56996158],
		[-74.09476401, 40.56996158],
		[-74.09476401,  40.70691754],
		[-74.30634782, 40.70691754]
	]]);

	const polygon1: GeoJSON.MultiPolygon = {
		'type': 'MultiPolygon',
		'coordinates': [extent1.coordinates]
	};

	// Big
	const extent2 = <GeoJSON.Polygon> turf.geometry('Polygon', [[
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

	describe('getFootprintIntersectionRatioInExtent', () => {
		it('should extent intersection area be', function () {
			expect(getFootprintIntersectionRatioInExtent(extent1, polygon2)).toBeGreaterThan(1);
		});

		it('should extent intersection area be', function () {
			expect(getFootprintIntersectionRatioInExtent(extent2, polygon1)).toBeLessThan(0.0001);
		});
	});
});
