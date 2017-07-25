import { TestBed, inject } from '@angular/core/testing';
import { OverlaysService, OverlaysConfig } from './overlays.service';
import { IOverlayState, overlayInitialState } from '../reducers/overlays.reducer';
import { HttpModule, XHRBackend, Response, ResponseOptions, Http } from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import * as turf from '@turf/turf';
import { Overlay } from '../models/overlay.model';
import { BaseOverlaySourceProvider, IFetchParams } from '@ansyn/overlays';

export class OverlaySourceProviderMock extends BaseOverlaySourceProvider {
	sourceType = "Mock";

	public fetch(fetchParams: IFetchParams): Observable<Overlay[]> {
		return Observable.create((observer: Observer<Overlay[]>) => {
			const overlays: Overlay[] = [
				{id: "abc", sourceType: "mock1", azimuth: 0, date: new Date(1999), photoTime: "dsds", name: "first"},
				{id: "abc", sourceType: "mock2", azimuth: 0, date: new Date(1987), photoTime: "beww", name: "second"}
			]
			observer.next(overlays);
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
			{key: "a", value: 1},
			{key: "b", value: 2}
		]
	};
	let searchParams = {
		polygon: {
			"type": "Polygon",
			"coordinates": [
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
		from: new Date(2020),
		to: Date.now()
	};

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				OverlaysService,
				{provide: XHRBackend, useClass: MockBackend},
				{provide: OverlaysConfig, useValue: {}},
				{provide: BaseOverlaySourceProvider, useClass: OverlaySourceProviderMock}
			],
			imports: [HttpModule]
		});
	});

	beforeEach(inject([OverlaysService, XHRBackend, Http, BaseOverlaySourceProvider], (_overlaysService: OverlaysService, _mockBackend, _http, _baseSourceProvider: BaseOverlaySourceProvider) => {
		overlaysService = _overlaysService;
		mockBackend = _mockBackend;
		http = _http;
		baseSourceProvider = _baseSourceProvider;

		mockBackend.connections.subscribe((connection: any) => {
			if (connection.request.url == "//localhost:8037/api/mock/eventDrops/data") {
				connection.mockRespond(new Response(new ResponseOptions({
					body: JSON.stringify(response)
				})));
			}

			if (connection.request.url == "error") {
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
	it('sortDropsByDates should get overlay array and sord by photoTime', () => {
		let overlayArray: Overlay = <any>[
			{id: 'id1', date: new Date(1000)},
			{id: 'id2', date: new Date(3000)},
			{id: 'id3', date: new Date(7000)},
			{id: 'id4', date: new Date(2000)}
		];
		overlayArray = <any> overlaysService.setSortedDropsMap(<any>overlayArray);
		expect(overlayArray[0]).toEqual({id: 'id1', date: new Date(1000)});
		expect(overlayArray[1]).toEqual({id: 'id4', date: new Date(2000)});
		expect(overlayArray[2]).toEqual({id: 'id2', date: new Date(3000)});
		expect(overlayArray[3]).toEqual({id: 'id3', date: new Date(7000)});
	});

	it('check all dependencies are defined properly', () => {
		expect(overlaysService).toBeTruthy();

	});


	it('check the method fetchData with mock data', () => {

		overlaysService.search(searchParams).subscribe((result: any) => {
			expect(result.length).toBe(2);
		});

	});

	it('check parseOverlayDataForDisplay', () => {

		const mockData = {
			filters: {},
			overlays: new Map()
		};
		overlaysTmpData.forEach(item => {
			mockData.overlays.set(item.id, item);
		});

		const result = overlaysService.parseOverlayDataForDispaly(<any>mockData.overlays, <any>mockData.filters);
		expect(result[0].name).toBe(undefined);
		expect(result[0].data.length).toBe(overlaysTmpData.length);
	});

	it('compare overlay ', () => {
		const mockData = {
			filters: {},
			overlays: new Map()
		};
		overlaysTmpData.forEach(item => {
			mockData.overlays.set(item.id, item);
		});

		const overlayState1: IOverlayState = Object.assign({}, overlayInitialState);
		const overlayState2: IOverlayState = Object.assign({}, overlayInitialState);
		expect(overlaysService.compareOverlays(overlayState1, overlayState2)).toBeTruthy();

		overlayState1.overlays = mockData;
		expect(overlaysService.compareOverlays(overlayState1, overlayState2)).toBeFalsy();

	})

	it('check the method fetchData with spyOn', () => {
		let response = new Response(new ResponseOptions({
			body: JSON.stringify({key: 'value'})
		}));

		spyOn(baseSourceProvider, 'fetch').and.callFake(function () {
			return Observable.create((observer: Observer<any>) => {
				observer.next(response.json());
			});
		});

		overlaysService.search(searchParams).subscribe((result: any) => {
			expect(result.key).toBe('value');
		});

		response = new Response(new ResponseOptions({
			body: JSON.stringify({key: 'value2'})
		}));

		overlaysService.search(searchParams).subscribe((result: any) => {
			expect(result.key).toBe('value2');
		});
	})

	it('check the method searchOverlay with spyOn', () => {

		let response = new Response(new ResponseOptions({
			body: JSON.stringify({key: 'value'})
		}));

		var calls = spyOn(baseSourceProvider, 'fetch').and.callFake(function () {
			return Observable.create((observer: Observer<any>) => {

				observer.next(response.json());
			});
		}).calls;


		let params = {
			polygon: {
				"type": "Polygon",
				"coordinates": [
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
			from: new Date(2020),
			to: Date.now()
		};
		overlaysService.search(
			params
		).subscribe((result: any) => {
			let requestBody = calls.allArgs()[0][1];
			let bbox = turf.bbox({type: 'Feature', geometry: params.polygon, properties: {}});
			let bboxFeature = turf.bboxPolygon(bbox);
			expect(result.key).toBe('value');
		});


		//var requestBody = spyOn(http,'post').calls.first();

	})

	// it('check the function extract data', () => {
	// 	let response = new Response(new ResponseOptions({
	// 		body: JSON.stringify({ key: 'value' })
	// 	}));

	// 	spyOn(http, 'get').and.callFake(function() {
	// 		return Observable.create((observer: Observer < any > ) => {
	// 			observer.next(response);
	// 		});
	// 	});

	// 	spyOn(overlaysService, "extractData");

	// });

	describe('getTimeStateByOverlay should calc delta and return new timelineState via overlay.date', () => {

		it('timelineState should go forwards', () => {
			const displayedOverlay = {
				date: new Date(6000)
			} as any;
			const timelineState = {
				from: new Date(0),
				to: new Date(5000)			//delta tenth is 500 ms
			};
			const {from, to} = overlaysService.getTimeStateByOverlay(displayedOverlay, timelineState);
			expect(from).toEqual(new Date(1500));
			expect(to).toEqual(new Date(6500));
		});

		it('timelineState should go backwards', () => {
			const displayedOverlay = {
				date: new Date(1000)
			} as any;
			const timelineState = {
				from: new Date(2000),
				to: new Date(7000)  //delta tenth is 500 ms
			};
			const {from, to} = overlaysService.getTimeStateByOverlay(displayedOverlay, timelineState);
			expect(from).toEqual(new Date(500));
			expect(to).toEqual(new Date(5500));
		})

	})
});
