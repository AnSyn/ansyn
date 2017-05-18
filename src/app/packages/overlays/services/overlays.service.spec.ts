import { TestBed, inject } from '@angular/core/testing';

import { OverlaysService, OverlaysConfig } from './overlays.service';

import { IOverlayState, overlayInitialState } from '../reducers/overlays.reducer';

import { HttpModule, XHRBackend, Response, ResponseOptions, Http, RequestOptions, Headers } from '@angular/http';

import { MockBackend } from '@angular/http/testing';

import { Observable, Observer } from 'rxjs';

import { configuration } from '../../../../configuration/configuration'

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

    it('check all dependencies are defined properly', () => {
        expect(overlaysService).toBeTruthy();

    });

    it('check the method fetchData with mock data', () => {

        overlaysService.fetchData().subscribe(result => {
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

        overlaysService.fetchData('tmp').subscribe(result => {
            expect(result.key).toBe('value');
        });

        response = new Response(new ResponseOptions({
            body: JSON.stringify({ key: 'value2' })
        }));

        overlaysService.fetchData('tmp').subscribe(result => {
            expect(result.key).toBe('value2');
        });
    })

    it('check that the url is correct without params', () => {
        const spyHandler = spyOn(http, 'get').and.returnValue(Observable.empty());
        overlaysService.fetchData('case/:id/overlays');
        expect(http.get).toHaveBeenCalledWith('case/:id/overlays', jasmine.any(RequestOptions));

        http.get.and.stub();

        spyHandler.and.returnValue(Observable.empty());
        overlaysService.fetchData('', { caseId: "123" });
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

        overlaysService.fetchData('tmp').subscribe(result => {
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

        overlaysService.fetchData('error').subscribe(result => {

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

        overlaysService.fetchData('tmp').subscribe(result => {

        }, error => {
            expect(overlaysService.handleError.calls.any()).toEqual(true);
        })
    });
});
