import { TestBed, inject } from '@angular/core/testing';

import { OverlaysService, OverlaysConfig } from './overlays.service';

import { IOverlayState, overlayInitialState } from '../reducers/overlays.reducer';

import { HttpModule, XHRBackend, Response, ResponseOptions, Http, RequestOptions, Headers } from '@angular/http';

import { MockBackend } from '@angular/http/testing';

import { Observable, Observer } from 'rxjs';

import * as turf from '@turf/turf';

import { configuration } from '../../../../configuration/configuration'
import { Overlay } from '../models/overlay.model';

describe('OverlaysService', () => {
	let overlaysService, mockBackend, lastConnection, http;
	let overlaysTmpData: any[];
	let response = {
		data: [
			{ key: "a", value: 1 },
			{ key: "b", value: 2 }
		]
	};

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				OverlaysService,
				{ provide: XHRBackend, useClass: MockBackend },
				{ provide: OverlaysConfig, useValue: configuration.OverlaysConfig }
			],
			imports: [HttpModule]
		});
	});

	beforeEach(inject([OverlaysService, XHRBackend, Http], (_overlaysService: OverlaysService, _mockBackend, _http) => {
		overlaysService = _overlaysService;
		mockBackend = _mockBackend;
		http = _http;

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
			{
				data:[
					{id: 'id1', date: new Date(1000)},
					{id: 'id2', date: new Date(3000)},
					{id: 'id3', date: new Date(7000)},
					{id: 'id4', date: new Date(2000)}
				]}
		];
		overlaysService.setSortedDropsMap(overlayArray);
		expect(overlaysService.sortedDropsIds[0]).toEqual('id1');
		expect(overlaysService.sortedDropsIds[1]).toEqual('id4');
		expect(overlaysService.sortedDropsIds[2]).toEqual('id2');
		expect(overlaysService.sortedDropsIds[3]).toEqual('id3');
	});

	it('check all dependencies are defined properly', () => {
		expect(overlaysService).toBeTruthy();

	});

	it('check the method fetchData with mock data', () => {

		overlaysService.getByCase().subscribe(result => {
			expect(result.data.length).toBe(2);
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

		const result = overlaysService.parseOverlayDataForDispaly(mockData.overlays, mockData.filters);
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
			body: JSON.stringify({ key: 'value' })
		}));

		spyOn(http, 'get').and.callFake(function() {
			return Observable.create((observer: Observer < any > ) => {
				observer.next(response);
			});
		});

		overlaysService.getByCase('tmp').subscribe(result => {
			expect(result.key).toBe('value');
		});

		response = new Response(new ResponseOptions({
			body: JSON.stringify({ key: 'value2' })
		}));

		overlaysService.getByCase('tmp').subscribe(result => {
			expect(result.key).toBe('value2');
		});
	})

	it('check the method searchOverlay with spyOn',() => {

		let response = new Response(new ResponseOptions({
			body: JSON.stringify({ key: 'value' })
		}));

		var calls = spyOn(http, 'post').and.callFake(function() {
			return Observable.create((observer: Observer < any > ) => {

				observer.next(response);
			});
		}).calls;


		let params =  {
			polygon:{
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
			"",
			params
		).subscribe(result => {
			let requestBody = calls.allArgs()[0][1];
			let bbox = turf.bbox({type: 'Feature', geometry: params.polygon, properties: {}});
			let bboxFeature = turf.bboxPolygon(bbox);
			expect(JSON.stringify(requestBody)).
			toEqual(JSON.stringify(
				{
					"region":bboxFeature.geometry,
					"timeRange":
						{
							"start": params.from,
							"end":params.to
						}
				}));
			expect(result.key).toBe('value');
		});


		//var requestBody = spyOn(http,'post').calls.first();

	})

	//@todo take the baseUrl string from the configuration
	it('check that the url is correct without params', () => {
		const spyHandler = spyOn(http, 'get').and.returnValue(Observable.empty());
		overlaysService.getByCase('case/:id/overlays');
		expect(http.get).toHaveBeenCalledWith('http://localhost:9001/api/v1/case/:id/overlays', jasmine.any(RequestOptions));
	});

	//@todo take the baseUrl string from the configuration
	it('check that the url is correct with params', () => {
		spyOn(http, 'get').and.returnValue(Observable.empty());
		overlaysService.getByCase('', { caseId: "123" });
		expect(http.get).toHaveBeenCalledWith('http://localhost:9001/api/v1/case/123/overlays', jasmine.any(RequestOptions));
	});

	it('check the function extract data', () => {
		let response = new Response(new ResponseOptions({
			body: JSON.stringify({ key: 'value' })
		}));

		spyOn(http, 'get').and.callFake(function() {
			return Observable.create((observer: Observer < any > ) => {
				observer.next(response);
			});
		});

		spyOn(overlaysService, "extractData");

		overlaysService.getByCase('tmp').subscribe(result => {
			expect(overlaysService.extractData).toHaveBeenCalled();
		})

	});

	it('check the function handle error', () => {
		let response = new Response(new ResponseOptions({
			status: 404,
			statusText: 'file not found'
		}));
		spyOn(http, 'get').and.callFake(function() {
			return Observable.create((observer: Observer < any > ) => {
				observer.error(response);
			});
		});

		spyOn(overlaysService, "handleError");

		overlaysService.getByCase('error').subscribe(result => {

		}, error => {
			expect(overlaysService.handleError.calls.any()).toEqual(true);
		})
	});

	it('check the function handle bed response (not json)', () => {
		let response = new Response(new ResponseOptions({
			status: 404,
			statusText: 'file not found'
		}));
		spyOn(http, 'get').and.callFake(function() {
			return Observable.create((observer: Observer < any > ) => {
				observer.next('some string');
			});
		});

		spyOn(overlaysService, "handleError");

		overlaysService.getByCase('tmp').subscribe(result => {

		}, error => {
			expect(overlaysService.handleError.calls.any()).toEqual(true);
		})
	});
});
