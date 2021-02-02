import { inject, TestBed } from '@angular/core/testing';
import { MultipleOverlaysSourceProvider } from './multiple-source-provider';
import { EMPTY, Observable, of, throwError } from 'rxjs';
import { cold } from 'jasmine-marbles';
import * as turf from '@turf/turf';
import { MultipleOverlaysSource, OverlaySourceProvider } from '../models/overlays-source-providers';
import { BaseOverlaySourceProvider, IFetchParams } from '../models/base-overlay-source-provider.model';
import { MultipleOverlaysSourceConfig } from '../../core/models/multiple-overlays-source-config';
import { LoggerService } from '../../core/services/logger.service';
import { GeoRegisteration, IOverlay, IOverlayError, IOverlaysFetchData } from '../models/overlay.model';
import { StatusBarConfig } from '../../status-bar/models/statusBar.config';
import { Store, StoreModule } from '@ngrx/store';

const overlays: IOverlaysFetchData = {
	data: [
		{
			id: '1',
			name: 'overlay',
			isGeoRegistered: GeoRegisteration.geoRegistered,
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
let store: Store<any>;

@OverlaySourceProvider({
	sourceType: 'Truthy'
})
class TruthyOverlaySourceProviderMock extends BaseOverlaySourceProvider {
	public fetch(fetchParams: IFetchParams): Observable<IOverlaysFetchData> {
		if (fetchParams.limit <= 0) {
			return of(emptyOverlays);
		}

		return of(overlays);
	}

	public getById(id: string, sourceType: string = null): Observable<IOverlay> {
		return EMPTY;
	}
}

@OverlaySourceProvider({
	sourceType: faultySourceType
})
class FaultyOverlaySourceProviderMock extends BaseOverlaySourceProvider {
	public fetch(fetchParams: IFetchParams): Observable<IOverlaysFetchData> {
		return throwError(new Error('Failed to fetch overlays'));
	}

	public getById(id: string, sourceType: string = null): Observable<IOverlay> {
		return EMPTY;
	}
}

const faultyError: IOverlayError = {
	message: 'Error: Failed to fetch overlays',
	sourceType: 'Faulty'
};

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
	timeRange: { start: new Date().toISOString(), end: new Date().toISOString() },
	dataInputFilters: []
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
		sensorNames: [null],
		coverage: [regionCoordinates]
	}
];
const loggerServiceMock = { error: (some) => null };
const statusBarConfigMock = { error: (some) => null };


describe('MultipleSourceProvider', () => {
	let multipleSourceProvider: MultipleOverlaysSourceProvider;

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
							indexProviders: {
								Truthy: { whitelist: whitelist, blacklist: [] }
							}
						}
					},
					{
						provide: StatusBarConfig,
						useValue: statusBarConfigMock
					},
					{
						provide: MultipleOverlaysSource,
						useClass: TruthyOverlaySourceProviderMock,
						multi: true
					}
				],
				imports: [StoreModule.forRoot({})]
			});
		});

		beforeEach(inject([MultipleOverlaysSourceProvider], _multipleSourceProvider => {
			multipleSourceProvider = _multipleSourceProvider;
			const provider = Object.values(multipleSourceProvider.overlaysSources)[0];
			multipleSourceProvider.selectedProviders = [
				{
					class: provider,
					name: 'mock'
				}
			];
		}));

		it('should return the correct overlays', () => {
			const expectedResults = cold('(b|)', { b: overlays });

			expect(multipleSourceProvider.fetch(fetchParams)).toBeObservable(expectedResults);
		});

		it('should return an empty array if there are no overlays', () => {
			const expectedResults = cold('(b|)', { b: emptyOverlays });

			expect(multipleSourceProvider.fetch(fetchParamsWithLimitZero)).toBeObservable(expectedResults);
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
					{
						provide: StatusBarConfig,
						useValue: []
					},
					MultipleOverlaysSourceProvider,
					{
						provide: MultipleOverlaysSourceConfig,
						useValue: {
							indexProviders: {
								Faulty: { whitelist: whitelist, blacklist: [] }
							}
						}
					},
					{
						provide: MultipleOverlaysSource,
						useClass: FaultyOverlaySourceProviderMock,
						multi: true
					}
				],
				imports: [StoreModule.forRoot({})]
			});
		});

		beforeEach(inject([MultipleOverlaysSourceProvider], _multipleSourceProvider => {
			multipleSourceProvider = _multipleSourceProvider;
			const provider = Object.values(multipleSourceProvider.overlaysSources)[0];
			multipleSourceProvider.selectedProviders = [
				{
					class: provider,
					name: 'mock'
				}
			];
		}));

		it('should return an error', () => {
			const expectedResults = cold('(b|)', { b: { errors: [faultyError], data: null, limited: -1 } });
			expect(multipleSourceProvider.fetch(fetchParams)).toBeObservable(expectedResults);
		});

	});

});
