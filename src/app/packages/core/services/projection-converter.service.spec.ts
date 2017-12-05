import { inject, TestBed } from '@angular/core/testing';

import { ProjectionConverterService } from './projection-converter.service';
import { toolsConfig } from '@ansyn/menu-items/tools/models';
import { CoordinatesSystem } from '../models/coordinate-system.model';

describe('ProjectionConverterService', () => {
	let projectionConverterService: ProjectionConverterService;
	const loned50 = 578040;
	const latd50 = 4507589;
	const lonwgs84 = -74.07609;
	const latwgs84 = 40.71401;
	const zoneForTest = 18;


	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [ProjectionConverterService, {
				provide: toolsConfig, useValue: {
					Proj4: {
						ed50: '+proj=utm +datum=ed50 +zone=${zone} +ellps=intl +units=m + no_defs',
						ed50Customized: ''
					}
				}
			}]
		});
	});

	beforeEach(inject([ProjectionConverterService], (_projectionConverterService: ProjectionConverterService) => {
		projectionConverterService = _projectionConverterService;
	}));

	it('should be created', () => {
		expect(projectionConverterService).toBeTruthy();
	});

	it('should convert wgs84geo', () => {
		const result = projectionConverterService.convertByProjectionDatum([lonwgs84, latwgs84],
			{ datum: 'wgs84', projection: 'geo' },
			{ datum: 'ed50', projection: 'utm' }).map((num) => Math.floor(num));
		expect(result).toEqual([loned50, latd50, zoneForTest]);
	});

	it('should convert ed50', () => {
		const result = projectionConverterService.convertByProjectionDatum([loned50, latd50, zoneForTest],
			{ datum: 'ed50', projection: 'utm' },
			{ datum: 'wgs84', projection: 'geo' }).map((num) => +num.toFixed(5));
		expect(result).toEqual([lonwgs84, latwgs84]);
	});

	describe(' validation: ', () => {
		// ------ isValidCoordinates ------ //
		it('isValidCoordinates should pass', () => {
			const result = ProjectionConverterService.isValidCoordinates([-80000, 100], 1);
			expect(result).toBeTruthy();
		});
		it('isValidCoordinates should fail', () => {
			const result = ProjectionConverterService.isValidCoordinates([0, null], 1);
			expect(result).toBeFalsy();
		});

		// ------ isValidWGS84 ------ //
		it('isValidCoordinates should pass', () => {
			const result1 = ProjectionConverterService.isValidWGS84([100, -80]);
			const result2 = ProjectionConverterService.isValidWGS84([0, 0]);
			expect(result1).toBeTruthy();
			expect(result2).toBeTruthy();
		});
		it('isValidCoordinates should fail', () => {
			const result1 = ProjectionConverterService.isValidWGS84([1, 91]);
			const result2 = ProjectionConverterService.isValidWGS84([-181, 1]);
			expect(result1).toBeFalsy();
			expect(result2).toBeFalsy();
		});
		// ------ isValidUTM ------ //
		it('isValidUTM should pass]', () => {
			const result1 = ProjectionConverterService.isValidUTM([10000, -80000, 36]);
			const result2 = ProjectionConverterService.isValidUTM([0, 0, 24]);
			expect(result1).toBeTruthy();
			expect(result2).toBeTruthy();
		});
		it('isValidCoordinates should fail', () => {
			const result1 = ProjectionConverterService.isValidUTM([10000, -80000, 70]);
			const result2 = ProjectionConverterService.isValidUTM([9999999999, 0, 24]);
			expect(result1).toBeFalsy();
			expect(result2).toBeFalsy();
		});
		// ------ isValidCoordinates ------ //
		const wgs84: CoordinatesSystem = { datum: 'wgs84', projection: 'geo' };
		const ed50: CoordinatesSystem = { datum: 'ed50', projection: 'utm' };

		it('isValidConversion should pass', () => {
			const fromED50 = projectionConverterService.isValidConversion([-80000, 100, 10], ed50);
			const fromWGS80 = projectionConverterService.isValidConversion([120, -80], wgs84);
			expect(fromED50).toBeTruthy();
			expect(fromWGS80).toBeTruthy();
		});
		it('isValidConversion shouldfail', () => {
			const fromED50Test1 = projectionConverterService.isValidConversion([-80000, 100], ed50);
			const fromED50Test2 = projectionConverterService.isValidConversion([-80000, null], ed50);
			const fromED50Test3 = projectionConverterService.isValidConversion([-80000, 100, null], ed50);
			const fromWGS80test1 = projectionConverterService.isValidConversion([120, -92], wgs84);
			const fromWGS80test2 = projectionConverterService.isValidConversion([189, -80], wgs84);
			expect(fromED50Test1).toBeFalsy();
			expect(fromED50Test2).toBeFalsy();
			expect(fromED50Test3).toBeFalsy();
			expect(fromWGS80test1).toBeFalsy();
			expect(fromWGS80test2).toBeFalsy();
		});
	});
});
