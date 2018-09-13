import { fakeAsync, inject, TestBed, tick } from '@angular/core/testing';

import { GeocoderService } from './geocoder.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { asyncData, ErrorHandlerService } from '@ansyn/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { mapFacadeConfig } from '../models/map-facade.config';
import { IMapFacadeConfig } from '../models/map-config.model';

describe('GeocoderService', () => {
	let me;
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule],
			providers: [GeocoderService,
				{
					provide: ErrorHandlerService, useValue: {
						httpErrorHandle: error => {
							console.log(error);
							return of(error);
						}
					}
				},
				{
					provide: mapFacadeConfig, useValue: <IMapFacadeConfig> {
						mapSearch: {
							url: 'find/$searchString/key/$apiKey',
							apiKey: 'myKey',
							active: true
						}
					}
				}
			]
		});
	});

	beforeEach(inject([GeocoderService], (service: GeocoderService) => {
		me = service;
	}));

	it('should be created', () => {
		expect(me).toBeTruthy();
	});

	describe('getLocation$', () => {
		let httpClient: HttpClient;
		let result$: Observable<any>;
		let endResult = null;

		beforeEach(() => {
			httpClient = TestBed.get(HttpClient);
		});

		it('should call http, extract the point, and return it', fakeAsync(() => {
			spyOn(httpClient, 'get').and.returnValue(asyncData({
				resourceSets: [
					{
						resources: [
							{ point: { type: 'Point', coordinates: [3, 4] } }
						]
					}
				]
			}));
			result$ = me.getLocation$('hehe');
			expect(httpClient.get).toHaveBeenCalledWith('find/hehe/key/myKey');
			result$.subscribe(res => {
				endResult = res;
			});
			tick();
			expect(endResult).toEqual({ type: 'Point', coordinates: [4, 3] });
		}));

		it('should return null, if there are no results', fakeAsync(() => {
			spyOn(httpClient, 'get').and.returnValue(asyncData({
				resourceSets: [
					{
						resources: []
					}
				]
			}));
			result$ = me.getLocation$('hehe');
			result$.subscribe(res => {
				endResult = res;
			});
			tick();
			expect(endResult).toBeFalsy();
		}));

		it('should return null, if there is an error, or unexpected format', fakeAsync(() => {
			spyOn(httpClient, 'get').and.returnValue(asyncData({}));
			result$ = me.getLocation$('hehe');
			result$.subscribe(res => {
				endResult = res;
			});
			tick();
			expect(endResult).toBeFalsy();
		}));
	});
});
