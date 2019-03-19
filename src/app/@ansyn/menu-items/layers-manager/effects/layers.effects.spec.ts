import { LayersEffects } from './layers.effects';
import { async, inject, TestBed } from '@angular/core/testing';
import { DataLayersService, layersConfig } from '../services/data-layers.service';
import { StoreModule } from '@ngrx/store';
import { layersFeatureKey, LayersReducer } from '../reducers/layers.reducer';
import { BeginLayerCollectionLoadAction, LayerCollectionLoadedAction } from '../actions/layers.actions';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { provideMockActions } from '@ngrx/effects/testing';
import { cold, hot } from 'jasmine-marbles';
import { ILayer, layerPluginTypeEnum, LayerType } from '../models/layers.model';
import { CoreConfig, ErrorHandlerService, LoggerService, StorageService } from '@ansyn/core';

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
				{ provide: StorageService, useValue: {} },
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

	it('beginLayerTreeLoad$ should dispatch LayerCollectionLoadedAction', () => {
		const timeOfCreation = new Date();
		const layers: ILayer[] = [{
			url: 'fakeStaticUrl',
			id: 'staticLayerId',
			name: 'staticLayer',
			type: LayerType.annotation,
			creationTime: timeOfCreation,
			layerPluginType: layerPluginTypeEnum.Annotations
		}];

		let serverResponse = [
			{
				url: 'fakeStaticUrl',
				id: 'staticLayerId',
				name: 'staticLayer',
				type: 'Annotation',
				layerPluginType: 'Annotations',
				creationTime: timeOfCreation
			}
		];


		spyOn(dataLayersService, 'getAllLayersInATree').and.returnValue(of(serverResponse));
		dataLayersService.getAllLayersInATree({ caseId: 'caseId' });

		actions = hot('--a--', { a: new BeginLayerCollectionLoadAction({ caseId: 'caseId' }) });
		const expectedResults = cold('--a--', {
			a: new LayerCollectionLoadedAction(layers)
		});
		expect(layersEffects.beginLayerTreeLoad$).toBeObservable(expectedResults);
	});

});
