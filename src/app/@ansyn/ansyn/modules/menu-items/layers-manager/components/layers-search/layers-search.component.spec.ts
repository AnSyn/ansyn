import { ComponentFixture, inject, TestBed, waitForAsync } from '@angular/core/testing';

import { LayersSearchComponent } from './layers-search.component';
import { ILayerState, layersFeatureKey, LayersReducer } from '../../reducers/layers.reducer';
import { layersConfig } from '../../services/data-layers.service';
import { Store, StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { MockComponent } from '../../../../core/test/mock-component';
import { SetToastMessageAction } from '@ansyn/map-facade';
import { ILayer, LayerSearchTypeEnum, LayerType } from '../../models/layers.model';
import { AddLayer, SetLayerSearchType } from '../../actions/layers.actions';

const limitError = 'error';
const limit = 2;
describe('LayersSearchComponent', () => {
	let component: LayersSearchComponent;
	let fixture: ComponentFixture<LayersSearchComponent>;
	let store: Store<ILayerState>;

	const mockAutoComplete = MockComponent({
		selector: 'ansyn-auto-complete',
		inputs: ['onInputChangeFn', 'keyFromText', 'allEntities'],
		outputs: ['selectChange']
	});
	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			declarations: [LayersSearchComponent, mockAutoComplete],
			imports: [
				StoreModule.forRoot({ [layersFeatureKey]: LayersReducer }),
				TranslateModule.forRoot()
			],
			providers: [
				{
					provide: layersConfig, useValue: {
						limit: limit,
						limitError: limitError
					}
				},
			]
		})
			.compileComponents();
	}));

	beforeEach(inject([Store], (_store) => {
		fixture = TestBed.createComponent(LayersSearchComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		store = _store;
		spyOn(store, 'dispatch');
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('addLayer', () => {
		const layer: ILayer = {
			creationTime: new Date(),
			id: 'layerId',
			layerPluginType: '',
			name: 'layer',
			type: LayerType.static
		};

		it('should fire SetToastMessageAction when openStaticLayers >= to config limit', () => {
			component.openStaticLayers = limit;
			component.addLayer(layer);
			expect(store.dispatch).toHaveBeenCalledWith(new SetToastMessageAction({toastText: limitError}))
		});

		it('should fire AddLayer when openStaticLayers < to config limit', () => {
			component.openStaticLayers = limit - 1;
			component.addLayer(layer);
			expect(store.dispatch).toHaveBeenCalledWith(new AddLayer(layer))
		})
	});


	describe('changeSearchType', () => {
		it('should switch to mapView if layerSearchType equal to searcType', () => {
			component.layerSearchType = LayerSearchTypeEnum.polygonView;
			component.changeSearchType(LayerSearchTypeEnum.polygonView);
			expect(store.dispatch).toHaveBeenCalledWith(new SetLayerSearchType(LayerSearchTypeEnum.mapView))
		});

		it('should switch to searcType if layerSearchType not equal to searcType', () => {
			component.layerSearchType = LayerSearchTypeEnum.mapView;
			component.changeSearchType(LayerSearchTypeEnum.polygonView);
			expect(store.dispatch).toHaveBeenCalledWith(new SetLayerSearchType(LayerSearchTypeEnum.polygonView))
		});
	});
});
