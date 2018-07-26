import { LayersEffects } from './layers.effects';
import { async, inject, TestBed } from '@angular/core/testing';
import { DataLayersService, layersConfig } from '../services/data-layers.service';
import { StoreModule } from '@ngrx/store';
import { layersFeatureKey, LayersReducer } from '../reducers/layers.reducer';
import { BeginLayerCollectionLoadAction, LayerCollectionLoadedAction } from '../actions/layers.actions';
import { Observable } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';
import { provideMockActions } from '@ngrx/effects/testing';
import { cold, hot } from 'jasmine-marbles';
import { ILayer, layerPluginType, LayerType } from '../models/layers.model';
import { CoreConfig } from '../../../core/models/core.config';
import { StorageService } from '../../../core/services/storage/storage.service';
import { LoggerService } from '../../../core/services/logger.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { HttpClient } from '@angular/common/http';

describe('LayersEffects', () => {
	let layersEffects: LayersEffects;
	let dataLayersService: DataLayersService;
	let actions: Observable<any>;
	let http: HttpClient;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				HttpClientModule,
				StoreModule.forRoot({ [layersFeatureKey]: LayersReducer })
			],
			providers: [
				{ provide: CoreConfig, useValue: {} },
				StorageService,
				{
					provide: LoggerService,
					useValue: { error: (some) => null }
				},
				{
					provide: ErrorHandlerService,
					useValue: { httpErrorHandle: (some) => null }
				},
				{ provide: CoreConfig, useValue: { storageService: { baseUrl: 'http://localhost:8080/api/store' } } },
				provideMockActions(() => actions),
				LayersEffects,
				DataLayersService, {
					provide: layersConfig,
					useValue: { layersByCaseIdUrl: null }
				}]
		}).compileComponents();
	}));

	beforeEach(inject([LayersEffects, DataLayersService, HttpClient], (_layersEffects: LayersEffects, _dataLayersService: DataLayersService, _http: HttpClient) => {
		layersEffects = _layersEffects;
		dataLayersService = _dataLayersService;
		http = _http;

	}));

	it('should be defined', () => {
		expect(layersEffects).toBeDefined();
	});

	fit('beginLayerTreeLoad$ should dispatch LayerCollectionLoadedAction', () => {
		const layers: ILayer[] = [{
			url: 'fakeStaticUrl',
			id: 'staticLayerId',
			name: 'staticLayer',
			type: LayerType.annotation,
			creationTime: new Date(),
			layerPluginType: layerPluginType.Annotations
		}];

		let serverResponse = {
			json: () => [
				{
					'id': 'layersContainerId_1234',
					'name': 'Roads',
					'type': 'Annotation',
					'layerPluginType': 'Annotations',
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

		spyOn(dataLayersService, 'getAllLayersInATree').and.returnValue(Observable.of(new Response(serverResponse)));
		dataLayersService.getAllLayersInATree({ caseId: 'caseId' });

		actions = hot('--a--', { a: new BeginLayerCollectionLoadAction({ caseId: 'caseId' }) });
		const expectedResults = cold('--a--', {
			a: new LayerCollectionLoadedAction(layers)
		});
		expect(layersEffects.beginLayerTreeLoad$).toBeObservable(expectedResults);
	});

});
