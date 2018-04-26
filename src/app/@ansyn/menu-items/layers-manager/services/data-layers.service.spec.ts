import { inject, TestBed } from '@angular/core/testing';
import { DataLayersService, layersConfig } from './data-layers.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { LoggerService } from '@ansyn/core/services/logger.service';
import { StorageService } from '@ansyn/core/services/storage/storage.service';
import { CoreConfig } from '@ansyn/core/models/core.config';
import { ErrorHandlerService } from '@ansyn/core/services/error-handler.service';

describe('DataLayersService', () => {
	let dataLayersService: DataLayersService;
	let http: HttpClient;
	let storageService: StorageService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientModule],
			providers: [
				{
					provide: CoreConfig,
					useValue: { storageService: { baseUrl: 'http://localhost:8080/api/store' }}
				},
				StorageService,
				DataLayersService,
				{
					provide: layersConfig,
					useValue: { 'schema': 'layers'}
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

	beforeEach(inject([StorageService, DataLayersService, HttpClient],
		(_storageService: StorageService, _dataLayersService: DataLayersService, _http: HttpClient) => {
		storageService = _storageService;
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
		expect(http.get).toHaveBeenCalledWith(`${storageService.config.storageService.baseUrl}/${dataLayersService.config.schema}`,
			{ params: { from: '0', limit: '100'}}
		);
	});
});
