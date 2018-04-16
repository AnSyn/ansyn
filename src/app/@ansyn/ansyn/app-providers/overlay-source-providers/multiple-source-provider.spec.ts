import { inject, TestBed } from '@angular/core/testing';
import { MultipleOverlaysSourceProvider } from './multiple-source-provider';
import {
	MultipleOverlaysSource,
	MultipleOverlaysSourceConfig
} from '@ansyn/ansyn/app-providers/overlay-source-providers/multiple-source-provider';
import { Overlay } from '@ansyn/overlays/models/overlay.model';
import { BaseOverlaySourceProvider, IFetchParams } from '@ansyn/overlays';
import { Observable } from 'rxjs/Rx';
import { OverlaysFetchData } from '@ansyn/core/models/overlay.model';
import { cold } from 'jasmine-marbles';
import * as turf from '@turf/turf';
import { LoggerService } from '@ansyn/core/services/logger.service';
import { LoggerConfig } from '@ansyn/core';
import { Injectable } from '@angular/core';

const overlays: OverlaysFetchData = {
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

const emptyOverlays: OverlaysFetchData = {
	data: [],
	limited: 0,
	errors: []
};

const faultySourceType = 'Faulty';

@Injectable()
class TruthyOverlaySourceProviderMock extends BaseOverlaySourceProvider {
	sourceType = 'Truthy';

	public fetch(fetchParams: IFetchParams): Observable<OverlaysFetchData> {
		if (fetchParams.limit <= 0) {
			return Observable.of(emptyOverlays);
		}

		return Observable.of(overlays);
	}

	public getStartDateViaLimitFacets(params: { facets, limit, region }): Observable<any> {
		return Observable.empty();
	}

	public getStartAndEndDateViaRangeFacets(params: { facets, limitBefore, limitAfter, date, region }): Observable<any> {
		return Observable.empty();
	}

	public getById(id: string, sourceType: string = null): Observable<Overlay> {
		return Observable.empty();
	}
}

@Injectable()
class FaultyOverlaySourceProviderMock extends BaseOverlaySourceProvider {
	sourceType = faultySourceType;

	public fetch(fetchParams: IFetchParams): Observable<OverlaysFetchData> {
		return Observable.throw(new Error('Failed to fetch overlays'));
	}

	public getStartDateViaLimitFacets(params: { facets, limit, region }): Observable<any> {
		return Observable.empty();
	}

	public getStartAndEndDateViaRangeFacets(params: { facets, limitBefore, limitAfter, date, region }): Observable<any> {
		return Observable.empty();
	}

	public getById(id: string, sourceType: string = null): Observable<Overlay> {
		return Observable.empty();
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
	timeRange: {start: new Date().toISOString(), end: new Date().toISOString()}
};

const fetchParamsWithLimitZero: any = { ...fetchParams, limit: 0};

const whitelist = [
	{
		name: 'Entire Earth',
		dates: [
			{
				start: null,
				end: null
			}
		],
		sensorNames: [
			null
		],
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
						Truthy: {whitelist: whitelist, blacklist: []}
					}
				},
				{
					provide: MultipleOverlaysSource,
					useClass: TruthyOverlaySourceProviderMock,
					multi: true
				}
			]
		});
	});

	beforeEach(inject([MultipleOverlaysSourceProvider], _multipleSourceProvider => {
		this.multipleSourceProvider = _multipleSourceProvider;
	}));

	it('should return the correct overlays', () => {
			const expectedResults = cold('(b|)', {b: overlays});

			expect(this.multipleSourceProvider.fetch(fetchParams)).toBeObservable(expectedResults);
	});

	it ('should return an empty array if there are no overlays', () => {
		const expectedResults = cold('(b|)', {b: emptyOverlays});

		expect(this.multipleSourceProvider.fetch(fetchParamsWithLimitZero)).toBeObservable(expectedResults);
	});

});

describe('MultipleSourceProvider with one faulty provider', () => {

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
						Faulty: {whitelist: whitelist, blacklist: []}
					}
				},
				{
					provide: MultipleOverlaysSource,
					useClass: FaultyOverlaySourceProviderMock,
					multi: true
				}
			]
		});
	});

	beforeEach(inject([MultipleOverlaysSourceProvider], _multipleSourceProvider => {
		this.multipleSourceProvider = _multipleSourceProvider;
	}));

	it('should return an error', () => {
		const expectedResults = cold('(b|)', { b: { errors: [faultyError], data: null, limited: -1} });

		expect(this.multipleSourceProvider.fetch(fetchParams)).toBeObservable(expectedResults);
	});

});

describe('MultipleSourceProvider with one faulty provider and one truthy provider', () => {

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				{
					provide: LoggerService,
					useValue: loggerServiceMock
				},
				MultipleOverlaysSourceProvider,
				{
					provide: MultipleOverlaysSourceConfig, useValue: {
						Truthy: {whitelist: whitelist, blacklist: []},
						Faulty: {whitelist: whitelist, blacklist: []}
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
				}
			]
		});
	});

	beforeEach(inject([MultipleOverlaysSourceProvider], _multipleSourceProvider => {
			this.multipleSourceProvider = _multipleSourceProvider;
	}));

	it('should return the expected overlays with one error', () => {
		const expectedResults = cold('(b|)', { b: { ...overlays, errors: [faultyError] }});

		expect(this.multipleSourceProvider.fetch(fetchParams)).toBeObservable(expectedResults);
	});

	it('should return an empty overlays array with one error', () => {
		const expectedResults = cold('(b|)', { b: { ...emptyOverlays, errors: [faultyError] }});

		expect(this.multipleSourceProvider.fetch(fetchParamsWithLimitZero)).toBeObservable(expectedResults);
	});

});
