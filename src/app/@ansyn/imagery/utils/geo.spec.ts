import * as turf from '@turf/turf';
import { getPolygonIntersectionRatio, isPointContainedInGeometry } from './geo';

describe('geo utils', () => {
	// polygon region
	const extent = <GeoJSON.Polygon>turf.geometry('Polygon', [
		[
			[
				-123.13373565673827,
				45.51067773196122
			],
			[
				-123.08429718017577,
				45.47120673790691
			],
			[
				-123.0362319946289,
				45.48372492603276
			],
			[
				-123.03657531738281,
				45.50730933674183
			],
			[
				-123.07228088378906,
				45.52607354310015
			],
			[
				-123.13373565673827,
				45.51067773196122
			]
		]
	]);

	const pointExtent = <GeoJSON.Point>turf.geometry('Point', [
		-123.07090759277344,
		45.50514383337021
	]);
	// contain
	const polygon1: GeoJSON.MultiPolygon = {
		'type': 'MultiPolygon',
		'coordinates': [[
			[
				[
					-123.13373565673827,
					45.51067773196122
				],
				[
					-123.08429718017577,
					45.47120673790691
				],
				[
					-123.0362319946289,
					45.48372492603276
				],
				[
					-123.03657531738281,
					45.50730933674183
				],
				[
					-123.07228088378906,
					45.52607354310015
				],
				[
					-123.13373565673827,
					45.51067773196122
				]
			]
		]]
	};

	// intersect
	const polygon2: GeoJSON.MultiPolygon = {
		'type': 'MultiPolygon',
	coordinates: [[
		[
			[
				-123.0698776245117,
				45.538820010517036
			],
			[
				-123.08773040771483,
				45.51765448081993
			],
			[
				-123.06095123291016,
				45.502978246693786
			],
			[
				-123.00601959228514,
				45.51693278828882
			],
			[
				-123.04000854492188,
				45.538820010517036
			],
			[
				-123.0698776245117,
				45.538820010517036
			]
		]
	]]};

	// not contain
	const polygon3: GeoJSON.MultiPolygon = {
		type: 'MultiPolygon',
		coordinates: [[
			[
				[
					-123.04344177246094,
					45.565265723023835
				],
				[
					-123.08704376220702,
					45.5469954685617
				],
				[
					-123.04790496826172,
					45.52054115838411
				],
				[
					-123.02318572998045,
					45.54002235832007
				],
				[
					-123.04344177246094,
					45.565265723023835
				]
			]
		]]
	};

	describe('getPolygonIntersectionRatio', () => {
		it('should extent intersection area be 1', function () {
			expect(getPolygonIntersectionRatio(extent, polygon1)).toBeGreaterThanOrEqual(1);
		});

		it('should extent intersection area between 0 to 1', function () {
			const ratio = getPolygonIntersectionRatio(extent, polygon2);
			expect(ratio).toBeGreaterThan(0);
			expect(ratio).toBeLessThan(1);
		});

		it('should extent intersection area be 0', () => {
			expect(getPolygonIntersectionRatio(extent, polygon3)).toEqual(0)
		})
	});

	describe('isPointContainedInGeometry', () => {
		it('should extent intersection area be 1', function () {
			expect(isPointContainedInGeometry(pointExtent, polygon1)).toBeTruthy();
		});
		it('should extent intersection area be 0', function () {
			expect(isPointContainedInGeometry(pointExtent, polygon3)).toBeFalsy();
		});
	})
});
