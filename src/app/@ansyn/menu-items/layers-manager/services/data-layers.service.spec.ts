import { inject, TestBed } from '@angular/core/testing';
import { DataLayersService, layersConfig } from './data-layers.service';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { StorageService } from '@ansyn/core/services/storage/storage.service';
import { CoreConfig } from '@ansyn/core/models/core.config';
import { LoggerService } from '@ansyn/core/services/logger.service';
import { ErrorHandlerService } from '@ansyn/core/services/error-handler.service';

describe('DataLayersService', () => {
	let dataLayersService: DataLayersService;
	let http: HttpClient;
	let storageService: StorageService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [
				HttpClientModule,
				StoreModule.forRoot({})
			],
			providers: [
				{
					provide: CoreConfig,
					useValue: { storageService: { baseUrl: 'http://localhost:8080/api/store' } }
				},
				StorageService,
				DataLayersService,
				{
					provide: layersConfig,
					useValue: { 'schema': 'layers' }
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

	it('should be created', inject([DataLayersService], (service: DataLayersService) => {
		expect(service).toBeTruthy();
	}));

	it('getAllLayersInATree get request', () => {
		let serverResponse = [
			{
				id: 'caseId',
				name: 'caseId',
				type: 'Static',
				dataLayers: [
					{
						'id': 'layerId_1234',
						'name': 'New York Roads',
						'isChecked': true
					}
				]
			}
		];

		spyOn(http, 'post').and.returnValue(Observable.of(serverResponse));
		dataLayersService.getAllLayersInATree({ caseId: 'caseId' });
		expect(http.post).toHaveBeenCalledWith(`${storageService.config.storageService.baseUrl}/${dataLayersService.config.schema}/search_by_case`,
			{ caseId: 'caseId' }
		);
	});
});
