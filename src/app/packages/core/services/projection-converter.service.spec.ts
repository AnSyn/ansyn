import { inject, TestBed } from '@angular/core/testing';

import { ProjectionConverterService } from './projection-converter.service';
import { toolsConfig } from '@ansyn/menu-items/tools/models';

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
});
