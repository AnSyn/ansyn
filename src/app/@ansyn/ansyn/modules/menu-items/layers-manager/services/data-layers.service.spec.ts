import { inject, TestBed } from '@angular/core/testing';
import { DataLayersService, layersConfig } from './data-layers.service';
import { of } from 'rxjs';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { CoreConfig } from '../../../core/models/core.config';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { LoggerService } from '../../../core/services/logger.service';
import { StorageService } from '../../../core/services/storage/storage.service';

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
				{
					provide: StorageService, useValue: {
						searchByCase: () => {}
					}
				},
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

		spyOn(storageService, 'searchByCase').and.returnValue(of(serverResponse));
		dataLayersService.getAllLayersInATree({ caseId: 'caseId' });
		expect(storageService.searchByCase).toHaveBeenCalledWith(dataLayersService.config.schema,
			{ caseId: 'caseId' }
		);
	});
});
