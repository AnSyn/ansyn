import { fakeAsync, inject, TestBed, tick } from '@angular/core/testing';

import { GeocoderService } from './geocoder.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { defer, Observable } from 'rxjs';
import { mapFacadeConfig } from '../models/map-facade.config';
import { IMapFacadeConfig } from '../models/map-config.model';

function asyncData<T>(data: T): Observable<T> {
	return defer(() => Promise.resolve(data));
}

describe('GeocoderService', () => {
	let me;
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule],
			providers: [
				GeocoderService,
				{
					provide: mapFacadeConfig,
					useValue: <IMapFacadeConfig>{
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
							{
								name: 'TestLocation',
								point: { type: 'Point', coordinates: [3, 4] }
							}
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
			expect(endResult).toEqual([{ name: 'TestLocation', point: { type: 'Point', coordinates: [4, 3] } }]);
		}));

		it('should return [{ name: \'No results\', point: undefined }], if there are no results', fakeAsync(() => {
			spyOn(httpClient, 'get').and.returnValue(asyncData({
				resourceSets: [[]]
			}));
			result$ = me.getLocation$('abcd');
			result$.subscribe(res => {
				endResult = res;
			});
			tick();
			expect(endResult).toEqual([{ name: 'No results', point: undefined }]);
		}));

		it('should return ([{ name: \'No results\', point: undefined }]), if there is an error, or unexpected format', fakeAsync(() => {
			spyOn(console, 'warn');
			spyOn(httpClient, 'get').and.returnValue(asyncData({}));
			result$ = me.getLocation$('hehe');
			result$.subscribe(res => {
				endResult = res;
			});
			tick();
			expect(console.warn).toHaveBeenCalled();
			expect(endResult).toEqual([{ name: 'No results', point: undefined }]);
		}));
	});
});
