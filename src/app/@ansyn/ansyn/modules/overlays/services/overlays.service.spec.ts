import { inject, TestBed } from '@angular/core/testing';
import { OverlaysConfig, OverlaysService } from './overlays.service';
import { IOverlayDropSources, OverlayReducer, overlaysFeatureKey } from '../reducers/overlays.reducer';
import { Response, ResponseOptions, XHRBackend } from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { EMPTY, Observable, Observer, of } from 'rxjs';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { BaseOverlaySourceProvider, IFetchParams } from '../models/base-overlay-source-provider.model';
import { MultipleOverlaysSourceProvider } from './multiple-source-provider';
import { StoreModule } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { LoggerService } from '../../core/services/logger.service';
import { OverlaySourceProvider } from '../models/overlays-source-providers';
import {
	GeoRegisteration,
	IOverlay,
	IOverlaysCriteria,
	IOverlaysFetchData,
	IOverlaySpecialObject
} from '../models/overlay.model';

@OverlaySourceProvider({
	sourceType: 'Mock'
})
export class OverlaySourceProviderMock extends BaseOverlaySourceProvider {
	public getStartDateViaLimitFacets(params: { facets, limit, region }): Observable<any> {
		return EMPTY;
	};

	public getStartAndEndDateViaRangeFacets(params: { facets, limitBefore, limitAfter, date, region }): Observable<any> {
		return EMPTY;
	};

	public getById(id: string, sourceType: string = null): Observable<IOverlay> {
		return of(<any>{});
	};

	public fetch(fetchParams: IFetchParams): Observable<IOverlaysFetchData> {
		return Observable.create((observer: Observer<IOverlaysFetchData>) => {
			const overlays: IOverlay[] = [
				{
					id: 'abc',
					sourceType: 'mock1',
					azimuth: 0,
					date: new Date(1999),
					photoTime: 'dsds',
					name: 'first',
					isGeoRegistered: GeoRegisteration.geoRegistered
				},
				{
					id: 'abc',
					sourceType: 'mock2',
					azimuth: 0,
					date: new Date(1987),
					photoTime: 'beww',
					name: 'second',
					isGeoRegistered: GeoRegisteration.geoRegistered
				}
			];
			observer.next({ data: overlays, limited: 3 });
			observer.complete();
		});
	}

	getOverlayById(id: string): Observable<IOverlay> {
		return Observable.create((observer: Observer<IOverlay>) => {
			const overlay: any = {
				id: 'abc',
				sourceType: 'mock1',
				azimuth: 0,
				date: new Date(1999),
				photoTime: 'dsds',
				name: 'first',
				isGeoRegistered: GeoRegisteration.geoRegistered
			};
			observer.next(overlay);
			observer.complete();
		});
	}
}

describe('OverlaysService', () => {
	let overlaysService: OverlaysService, mockBackend, lastConnection, http;
	let multipleOverlaysSourceProvider: MultipleOverlaysSourceProvider;
	let overlaysTmpData: IOverlay[];
	let favoriteOverlays: IOverlay[];
	let response = {
		data: [
			{ key: 'a', value: 1 },
			{ key: 'b', value: 2 }
		]
	};
	let searchParams: IOverlaysCriteria = {
		region: {
			'type': 'Polygon',
			'coordinates': [
				[
					[
						-14.4140625,
						59.99349233206085
					],
					[
						37.96875,
						59.99349233206085
					],
					[
						37.96875,
						35.915747419499695
					],
					[
						-14.4140625,
						35.915747419499695
					],
					[
						-14.4140625,
						59.99349233206085
					]
				]
			]
		},
		time: {
			type: 'absolute',
			from: new Date(2020),
			to: new Date()
		},
		dataInputFilters: {
			fullyChecked: true,
			filters: [],
			active: true
		}
	};

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				OverlaysService,
				{ provide: LoggerService, useValue: { error: (some) => null } },
				{ provide: XHRBackend, useClass: MockBackend },
				{ provide: OverlaysConfig, useValue: {} },
				{ provide: MultipleOverlaysSourceProvider, useClass: OverlaySourceProviderMock }
			],
			imports: [
				HttpClientModule,
				StoreModule.forRoot({
					[overlaysFeatureKey]: OverlayReducer
				})
			]
		});
	});

	beforeEach(inject([OverlaysService, XHRBackend, HttpClient, MultipleOverlaysSourceProvider], (_overlaysService: OverlaysService, _mockBackend, _http, _multipleOverlaysSourceProvider: MultipleOverlaysSourceProvider) => {
		overlaysService = _overlaysService;
		mockBackend = _mockBackend;
		http = _http;
		multipleOverlaysSourceProvider = _multipleOverlaysSourceProvider;

		mockBackend.connections.subscribe((connection: any) => {
			if (connection.request.url === '//localhost:8037/api/mock/eventDrops/data') {
				connection.mockRespond(new Response(new ResponseOptions({
					body: JSON.stringify(response)
				})));
			}

			if (connection.request.url === 'error') {
				connection.mockError(new Error('Username or password is incorrect'));
			}
		});

		const overlayDefaultValues = () => ({
			photoTime: new Date().toISOString(),
			date: new Date(),
			azimuth: 10,
			isGeoRegistered: GeoRegisteration.geoRegistered
		});

		overlaysTmpData = [{
			id: '12',
			name: 'tmp12',
			...overlayDefaultValues()
		}, {
			id: '13',
			name: 'tmp13',
			...overlayDefaultValues()
		}, {
			id: '16',
			name: 'tmp16',
			...overlayDefaultValues()
		}];

		favoriteOverlays = [overlaysTmpData[1], {
			id: '14',
			name: 'tmp14',
			...overlayDefaultValues()
		}];

	}));

	it('pluck check that pluck function returns smaller object from overlays', () => {
		const objectMap = new Map([
			['1', { id: '1', name: 'tmp1', value: '2' }],
			['2', { id: '2', name: 'tmp1', value: '2' }],
			['3', { id: '3', name: 'tmp1', value: '2' }],
			['4', { id: '4', name: 'tmp1', value: '2' }],
			['5', { id: '5', name: 'tmp1', value: '2' }],
			['6', { id: '6', name: 'tmp1', value: '2' }]
		]);
		const result = OverlaysService.pluck(objectMap, ['1', '2', '6'], ['id', 'name']);
		expect(result.length).toBe(3);
		expect(Object.keys(result[0]).length).toBe(2);
	});

	it('check all dependencies are defined properly', () => {
		expect(overlaysService).toBeTruthy();

	});


	it('check the method fetchData with mock data', () => {

		overlaysService.search(searchParams).subscribe((result: any) => {
			expect(result.data.length).toBe(2);
			expect(result.limited).toBe(3);
		});

	});

	it('parseOverlayDataForDisplay function with special objects', () => {

		const mockData = {
			overlaysArray: overlaysTmpData,
			filteredOverlays: ['13', '16'],
			specialObjects: new Map<string, IOverlaySpecialObject>(),
			favoriteOverlays: favoriteOverlays,
			showOnlyFavorites: false
		} as IOverlayDropSources;

		const result = OverlaysService.parseOverlayDataForDisplay(mockData);
		expect(result.length).toBe(3);

		mockData.specialObjects.set('15', { id: '15', shape: 'star', date: new Date() });

		const result2 = OverlaysService.parseOverlayDataForDisplay(mockData);
		expect(result2.length).toBe(4);

		mockData.showOnlyFavorites = true;
		const result3 = OverlaysService.parseOverlayDataForDisplay(mockData);
		expect(result3.length).toBe(3);
	});

	it('check the method fetchData with spyOn', () => {
		let response = { key: 'value' };

		spyOn(multipleOverlaysSourceProvider, 'fetch').and.callFake(() => {
			return Observable.create((observer: Observer<any>) => observer.next(response));
		});

		overlaysService.search(searchParams).subscribe((result: any) => {
			expect(result.key).toBe('value');
		});

		response = { key: 'value2' };

		overlaysService.search(searchParams).subscribe((result: any) => {
			expect(result.key).toBe('value2');
		});
	});

	it('check the method searchOverlay with spyOn', () => {
		let response = { key: 'value' };

		let calls = spyOn(multipleOverlaysSourceProvider, 'fetch').and.callFake(function () {
			return Observable.create((observer: Observer<any>) => observer.next(response));
		}).calls;


		let params: IOverlaysCriteria = {
			region: {
				'type': 'Polygon',
				'coordinates': [
					[
						[
							-14.4140625,
							59.99349233206085
						],
						[
							37.96875,
							59.99349233206085
						],
						[
							37.96875,
							35.915747419499695
						],
						[
							-14.4140625,
							35.915747419499695
						],
						[
							-14.4140625,
							59.99349233206085
						]
					]
				]
			},
			time: {
				type: 'absolute',
				from: new Date(2020),
				to: new Date()
			},
			dataInputFilters: {
				fullyChecked: true,
				filters: [],
				active: true
			}
		};
		overlaysService.search(params).subscribe((result: any) => {
			expect(result.key).toBe('value');
		});

	});

	it('check the method getOverlayById with mock data Mock provider', (done) => {
		overlaysService.getOverlayById('test', 'Mock').pipe(take(1)).subscribe((result: any) => {
			done();
			expect(result).toBeTruthy();
		});
	});

	describe('getTimeStateByOverlay should calc delta and return new timelineState via overlay.date', () => {

		it('timelineState should go forwards', () => {
			const displayedOverlay = {
				date: new Date(6000)
			} as any;
			const timelineState = {
				start: new Date(1000),
				end: new Date(5000) // delta tenth is 500 ms
			};
			const { start, end } = overlaysService.getTimeStateByOverlay(displayedOverlay, timelineState);
			expect(start.getTime()).toEqual(new Date(1000).getTime());
			expect(end.getTime()).toEqual(new Date(6200).getTime());
		});

		it('timelineState should not move', () => {
			const displayedOverlay = {
				date: new Date(4000)
			} as any;
			const timelineState = {
				start: new Date(2000),
				end: new Date(7000) // delta tenth is 500 ms
			};
			const { start, end } = overlaysService.getTimeStateByOverlay(displayedOverlay, timelineState);
			expect(start.getTime()).toEqual(new Date(2000).getTime());
			expect(end.getTime()).toEqual(new Date(7000).getTime());
		});

	});
});
