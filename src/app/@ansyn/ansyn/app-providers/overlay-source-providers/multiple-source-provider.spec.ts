import { inject, TestBed } from '@angular/core/testing';
import {
	MultipleOverlaysSource,
	MultipleOverlaysSourceConfig,
	MultipleOverlaysSourceProvider
} from './multiple-source-provider';

import { IOverlay, IOverlaysFetchData, LoggerService } from '@ansyn/core';
import { EMPTY, Observable, of, throwError } from 'rxjs';
import { cold } from 'jasmine-marbles';
import * as turf from '@turf/turf';
import { Injectable } from '@angular/core';
import { BaseOverlaySourceProvider, IFetchParams } from '@ansyn/overlays';
import { RouterTestingModule } from '@angular/router/testing';
import { Auth0Service } from '../../../login/services/auth0.service';
import { Auth0Config } from '../../../login/services/auth0.model';

const overlays: IOverlaysFetchData = {
	data: [
		{
			id: '1',
			name: 'overlay',
			isGeoRegistered: true,
			photoTime: new Date().toISOString(),
			date: new Date(),
			azimuth: 0
		}],
	limited: 1,
	errors: []
};

const emptyOverlays: IOverlaysFetchData = {
	data: [],
	limited: 0,
	errors: []
};

const faultySourceType = 'Faulty';

@Injectable()
class TruthyOverlaySourceProviderMock extends BaseOverlaySourceProvider {
	sourceType = 'Truthy';

	public fetch(fetchParams: IFetchParams): Observable<IOverlaysFetchData> {
		if (fetchParams.limit <= 0) {
			return of(emptyOverlays);
		}

		return of(overlays);
	}

	public getStartDateViaLimitFacets(params: { facets, limit, region }): Observable<any> {
		return EMPTY;
	}

	public getStartAndEndDateViaRangeFacets(params: { facets, limitBefore, limitAfter, date, region }): Observable<any> {
		return EMPTY;
	}

	public getById(id: string, sourceType: string = null): Observable<IOverlay> {
		return EMPTY;
	}
}

@Injectable()
class FaultyOverlaySourceProviderMock extends BaseOverlaySourceProvider {
	sourceType = faultySourceType;

	public fetch(fetchParams: IFetchParams): Observable<IOverlaysFetchData> {
		return throwError(new Error('Failed to fetch overlays'));
	}

	public getStartDateViaLimitFacets(params: { facets, limit, region }): Observable<any> {
		return EMPTY;
	}

	public getStartAndEndDateViaRangeFacets(params: { facets, limitBefore, limitAfter, date, region }): Observable<any> {
		return EMPTY;
	}

	public getById(id: string, sourceType: string = null): Observable<IOverlay> {
		return EMPTY;
	}
}

const faultyError = new Error(`Failed to fetch overlays from ${faultySourceType}`);
const regionCoordinates = [
	[
		[
			-180,
			-90
		],
		[
			-180,
			90
		],
		[
			180,
			90
		],
		[
			180,
			-90
		],
		[
			-180,
			-90
		]
	]
];

const fetchParams: any = {
	limit: 250,
	region: turf.geometry('Polygon', regionCoordinates),
	timeRange: { start: new Date().toISOString(), end: new Date().toISOString() }
};

const fetchParamsWithLimitZero: any = { ...fetchParams, limit: 0 };

const whitelist = [
	{
		name: 'Entire Earth',
		dates: [
			{
				start: null,
				end: null
			}
		],
		sensorNames: '[ null ]',
		coverage: [regionCoordinates]
	}
];
const loggerServiceMock = { error: (some) => null };

describe('MultipleSourceProvider with one truthy provider', () => {

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				{
					provide: LoggerService,
					useValue: loggerServiceMock
				},
				MultipleOverlaysSourceProvider,
				{
					provide: MultipleOverlaysSourceConfig,
					useValue: {
						Truthy: { whitelist: whitelist, blacklist: [] }
					}
				},
				{
					provide: MultipleOverlaysSource,
					useClass: TruthyOverlaySourceProviderMock,
					multi: true
				},
				Auth0Service,
				{
					provide: Auth0Config,
					useValue: {
						auth0Active: 'false',
						clientID: 'KXLTbs08LtLqrbPwSgn7Ioej0aMB7tf6',
						domain: 'imisight-sat.auth0.com',
						responseType: 'token id_token',
						audience: 'https://gw.sat.imisight.net',
						callbackURL: 'http://localhost:4200/#/callback/',
						scope: 'openid'
					}
				}
			]
		});
	});

	beforeEach(inject([MultipleOverlaysSourceProvider], _multipleSourceProvider => {
		this.multipleSourceProvider = _multipleSourceProvider;
	}));

	it('should return the correct overlays', () => {
		const expectedResults = cold('(b|)', { b: overlays });

		expect(this.multipleSourceProvider.fetch(fetchParams)).toBeObservable(expectedResults);
	});

	it('should return an empty array if there are no overlays', () => {
		const expectedResults = cold('(b|)', { b: emptyOverlays });

		expect(this.multipleSourceProvider.fetch(fetchParamsWithLimitZero)).toBeObservable(expectedResults);
	});

});

describe('MultipleSourceProvider with one faulty provider', () => {

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [RouterTestingModule],
			providers: [
				{
					provide: LoggerService,
					useValue: loggerServiceMock
				},
				MultipleOverlaysSourceProvider,
				{
					provide: MultipleOverlaysSourceConfig,
					useValue: {
						Faulty: { whitelist: whitelist, blacklist: [] }
					}
				},
				{
					provide: MultipleOverlaysSource,
					useClass: FaultyOverlaySourceProviderMock,
					multi: true
				},
				Auth0Service,
				{
					provide: Auth0Config,
					useValue: {
						auth0Active: 'false',
						clientID: 'KXLTbs08LtLqrbPwSgn7Ioej0aMB7tf6',
						domain: 'imisight-sat.auth0.com',
						responseType: 'token id_token',
						audience: 'https://gw.sat.imisight.net',
						callbackURL: 'http://localhost:4200/#/callback/',
						scope: 'openid'
					}
				}
			]
		});
	});

	beforeEach(inject([MultipleOverlaysSourceProvider], _multipleSourceProvider => {
		this.multipleSourceProvider = _multipleSourceProvider;
	}));

	it('should return an error', () => {
		const expectedResults = cold('(b|)', { b: { errors: [faultyError], data: null, limited: -1 } });

		expect(this.multipleSourceProvider.fetch(fetchParams)).toBeObservable(expectedResults);
	});

});

describe('MultipleSourceProvider with one faulty provider and one truthy provider', () => {

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [RouterTestingModule],
			providers: [
				{
					provide: LoggerService,
					useValue: loggerServiceMock
				},
				MultipleOverlaysSourceProvider,
				{
					provide: MultipleOverlaysSourceConfig, useValue: {
						Truthy: { whitelist: whitelist, blacklist: [] },
						Faulty: { whitelist: whitelist, blacklist: [] }
					}
				},
				{
					provide: MultipleOverlaysSource,
					useClass: TruthyOverlaySourceProviderMock,
					multi: true
				},
				{
					provide: MultipleOverlaysSource,
					useClass: FaultyOverlaySourceProviderMock,
					multi: true
				},
				Auth0Service,
				{
					provide: Auth0Config,
					useValue: {
						auth0Active: 'false',
						clientID: 'KXLTbs08LtLqrbPwSgn7Ioej0aMB7tf6',
						domain: 'imisight-sat.auth0.com',
						responseType: 'token id_token',
						audience: 'https://gw.sat.imisight.net',
						callbackURL: 'http://localhost:4200/#/callback/',
						scope: 'openid'
					}
				}
			]
		});
	});

	beforeEach(inject([MultipleOverlaysSourceProvider], _multipleSourceProvider => {
		this.multipleSourceProvider = _multipleSourceProvider;
	}));

	it('should return the expected overlays with one error', () => {
		const expectedResults = cold('(b|)', { b: { ...overlays, errors: [faultyError] } });

		expect(this.multipleSourceProvider.fetch(fetchParams)).toBeObservable(expectedResults);
	});

	it('should return an empty overlays array with one error', () => {
		const expectedResults = cold('(b|)', { b: { ...emptyOverlays, errors: [faultyError] } });

		expect(this.multipleSourceProvider.fetch(fetchParamsWithLimitZero)).toBeObservable(expectedResults);
	});

});
