import { inject, TestBed } from '@angular/core/testing';
import { DataLayersService, layersConfig } from './data-layers.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { LoggerService } from '@ansyn/core/services/logger.service';
import { ErrorHandlerService } from '@ansyn/core';

describe('DataLayersService', () => {
	let dataLayersService: DataLayersService;
	let http: HttpClient;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientModule],
			providers: [
				DataLayersService,
				{
					provide: layersConfig,
					useValue: { 'layersByCaseIdUrl': 'http://localhost:9001/api/v1/layers'}
				},
				{
					provide: LoggerService,
					useValue: { error: (some) => null }
				},
				{
					provide: ErrorHandlerService,
					useValue: { httpErrorHandle: (some) => null }
				}

			]
		});
	});

	beforeEach(inject([DataLayersService, HttpClient], (_dataLayersService: DataLayersService, _http: HttpClient) => {
		dataLayersService = _dataLayersService;
		http = _http;
	}));

	it('should ...', inject([DataLayersService], (service: DataLayersService) => {
		expect(service).toBeTruthy();
	}));

	it('getAllLayersInATree get request', () => {
		let serverResponse = {
			json: () => [
				{
					'id': 'layersContainerId_1234',
					'name': 'Roads',
					'type': 'Static',
					'dataLayerContainers': [
						{
							'id': 'layersContainerId_1234',
							'name': 'New York Roads',
							'dataLayerContainers': [],
							'dataLayers': [
								{
									'id': 'layerId_1234',
									'name': 'Upper east side roads',
									'isChecked': true
								}
							]
						}
					],
					'dataLayers': [
						{
							'id': 'layerId_1234',
							'name': 'New York Roads',
							'isChecked': true
						}
					]
				}
			]
		};

		spyOn(http, 'get').and.returnValue(Observable.of(new Response(serverResponse)));
		dataLayersService.getAllLayersInATree();
		expect(http.get).toHaveBeenCalledWith(`${dataLayersService.baseUrl}/layers?from=0&limit=100`);
	});
});
