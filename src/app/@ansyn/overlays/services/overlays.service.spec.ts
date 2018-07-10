import { inject, TestBed } from '@angular/core/testing';
import { OverlaysConfig, OverlaysService } from './overlays.service';
import { IOverlaysState } from '../reducers/overlays.reducer';
import { Response, ResponseOptions, XHRBackend } from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { Observable } from 'rxjs';
import { Observer } from 'rxjs/Observer';
import { Overlay } from '../models/overlay.model';
import { OverlaysCriteria, OverlaysFetchData, OverlaySpecialObject } from '@ansyn/core/models/overlay.model';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { LoggerService } from '@ansyn/core/services/logger.service';
import { BaseOverlaySourceProvider } from '../models/base-overlay-source-provider.model';

export class OverlaySourceProviderMock extends BaseOverlaySourceProvider {
	sourceType = 'Mock';

	public getStartDateViaLimitFacets(params: { facets, limit, region }): Observable<any> {
		return Observable.empty();
	};

	public getStartAndEndDateViaRangeFacets(params: { facets, limitBefore, limitAfter, date, region }): Observable<any> {
		return Observable.empty();
	};

	public getById(id: string, sourceType: string = null): Observable<Overlay> {
		return Observable.empty();
	};

	public fetch(fetchParams: IFetchParams): Observable<OverlaysFetchData> {
		return Observable.create((observer: Observer<OverlaysFetchData>) => {
			const overlays: Overlay[] = [
				{
					id: 'abc',
					sourceType: 'mock1',
					azimuth: 0,
					date: new Date(1999),
					photoTime: 'dsds',
					name: 'first',
					isGeoRegistered: true
				},
				{
					id: 'abc',
					sourceType: 'mock2',
					azimuth: 0,
					date: new Date(1987),
					photoTime: 'beww',
					name: 'second',
					isGeoRegistered: true
				}
			];
			observer.next({ data: overlays, limited: 3 });
			observer.complete();
		});
	}

	getOverlayById(id: string): Observable<Overlay> {
		return Observable.create((observer: Observer<Overlay>) => {
			const overlay: any = {
				id: 'abc',
				sourceType: 'mock1',
				azimuth: 0,
				date: new Date(1999),
				photoTime: 'dsds',
				name: 'first',
				isGeoRegistered: true
			};
			observer.next(overlay);
			observer.complete();
		});
	}
}

describe('OverlaysService', () => {
	let overlaysService: OverlaysService, mockBackend, lastConnection, http;
	let baseSourceProvider: BaseOverlaySourceProvider;
	let overlaysTmpData: any[];
	let response = {
		data: [
			{ key: 'a', value: 1 },
			{ key: 'b', value: 2 }
		]
	};
	let searchParams: OverlaysCriteria = {
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
				{ provide: BaseOverlaySourceProvider, useClass: OverlaySourceProviderMock }
			],
			imports: [HttpClientModule]
		});
	});

	beforeEach(inject([OverlaysService, XHRBackend, HttpClient, BaseOverlaySourceProvider], (_overlaysService: OverlaysService, _mockBackend, _http, _baseSourceProvider: BaseOverlaySourceProvider) => {
		overlaysService = _overlaysService;
		mockBackend = _mockBackend;
		http = _http;
		baseSourceProvider = _baseSourceProvider;

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

		overlaysTmpData = [{
			id: '12',
			name: 'tmp12',
			photoTime: new Date(Date.now()),
			date: new Date(Date.now()),
			azimuth: 10
		}, {
			id: '13',
			name: 'tmp13',
			photoTime: new Date(Date.now()),
			date: new Date(Date.now()),
			azimuth: 10
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

	it('buildFilteredOverlays should build filtered overlays', () => {

		let o1 = { id: '1', date: new Date(0) },
			o2 = { id: '2', date: new Date(1) },
			o3 = { id: '3', date: new Date(2) },
			o6 = { id: '6', date: new Date(3) },
			parsedFilters = [ { key: 'fakeFilter', filterFunc: () => true } ],
			overlays = <any> [o1, o2, o3],
			favorites = <any> [o1, o6],
			showOnlyFavorite = false;

		let ids = OverlaysService.buildFilteredOverlays(overlays, parsedFilters, favorites, showOnlyFavorite);
		expect(ids).toEqual(['1', '2', '3', '6']);

		/* only favorite ids */
		showOnlyFavorite = true;
		ids = OverlaysService.buildFilteredOverlays(overlays, parsedFilters, favorites, showOnlyFavorite);
		expect(ids).toEqual(['1', '6']);

	});


	it('parseOverlayDataForDisplay function with special objects', () => {

		const mockData = {
			overlays: new Map(),
			filteredOverlays: ['13'],
			specialObjects: new Map<string, OverlaySpecialObject>()
		} as IOverlaysState;

		overlaysTmpData.forEach(item => {
			mockData.overlays.set(item.id, item);
		});

		const result = OverlaysService.parseOverlayDataForDisplay(mockData);
		expect(result.length).toBe(1);

		mockData.specialObjects.set('15', { id: '15', shape: 'star', date: new Date() });

		const result2 = OverlaysService.parseOverlayDataForDisplay(mockData);
		expect(result2.length).toBe(2);
	});

	it('check the method fetchData with spyOn', () => {
		let response = { key: 'value' };

		spyOn(baseSourceProvider, 'fetch').and.callFake(() => {
			return Observable.create((observer: Observer<any>) => observer.next(response));
		});

		overlaysService.search(searchParams).subscribe((result: any) => {
			console.log(result);
			expect(result.key).toBe('value');
		});

		response = { key: 'value2' };

		overlaysService.search(searchParams).subscribe((result: any) => {
			expect(result.key).toBe('value2');
		});
	});

	it('check the method searchOverlay with spyOn', () => {
		let response = { key: 'value' };

		let calls = spyOn(baseSourceProvider, 'fetch').and.callFake(function () {
			return Observable.create((observer: Observer<any>) => observer.next(response));
		}).calls;


		let params: OverlaysCriteria = {
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

	it('check the method getOverlayById with mock data IDAHO provider', () => {
		overlaysService.getOverlayById('test', 'IDAHO').subscribe((result: any) => {
			expect(result).toBeTruthy();
		});
	});

	it('check the method getOverlayById with mock data PLANET provider', () => {
		overlaysService.getOverlayById('test', 'PLANET').subscribe((result: any) => {
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
