import { LayersEffects } from './layers.effects';
import { async, inject, TestBed } from '@angular/core/testing';
import { DataLayersService, layersConfig } from '../services/data-layers.service';
import { StoreModule } from '@ngrx/store';
import { layersFeatureKey, LayersReducer } from '../reducers/layers.reducer';
import { BeginLayerCollectionLoadAction, LayerCollectionLoadedAction } from '../actions/layers.actions';
import { Observable } from 'rxjs/Observable';
import { HttpClientModule } from '@angular/common/http';
import { provideMockActions } from '@ngrx/effects/testing';
import { cold, hot } from 'jasmine-marbles';
import { LoggerService } from '@ansyn/core/services/logger.service';
import { CoreConfig } from '@ansyn/core/models/core.config';
import { StorageService } from '@ansyn/core/services/storage/storage.service';
import { ErrorHandlerService } from '@ansyn/core/services/error-handler.service';
import { ILayer, LayerType } from '@ansyn/menu-items/layers-manager/models/layers.model';

describe('LayersEffects', () => {
	let layersEffects: LayersEffects;
	let dataLayersService: DataLayersService;
	let actions: Observable<any>;

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
				provideMockActions(() => actions),
				LayersEffects,
				DataLayersService, {
					provide: layersConfig,
					useValue: { layersByCaseIdUrl: null }
				}]
		}).compileComponents();
	}));

	beforeEach(inject([LayersEffects, DataLayersService], (_layersEffects: LayersEffects, _dataLayersService: DataLayersService) => {
		layersEffects = _layersEffects;
		dataLayersService = _dataLayersService;

	}));

	it('should be defined', () => {
		expect(layersEffects).toBeDefined();
	});

	it('beginLayerTreeLoad$ should dispatch LayerCollectionLoadedAction', () => {
		let staticLayer: ILayer = {
			url: 'fakeStaticUrl',
			id: 'staticLayerId',
			name: 'staticLayer',
			type: LayerType.static,
			creationTime: new Date()
		};

		spyOn(dataLayersService, 'getAllLayersInATree').and.callFake(() => Observable.of([staticLayer]));
		actions = hot('--a--', { a: new BeginLayerCollectionLoadAction() });
		const expectedResults = cold('--a--', {
			a: new LayerCollectionLoadedAction([staticLayer])
		});
		expect(layersEffects.beginLayerTreeLoad$).toBeObservable(expectedResults);
	});

});
