import { ComponentFixture, inject, TestBed, waitForAsync } from '@angular/core/testing';

import { LayersSearchComponent } from './layers-search.component';
import { ILayerState, layersFeatureKey, LayersReducer } from '../../reducers/layers.reducer';
import { layersConfig } from '../../services/data-layers.service';
import { Store, StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { MockComponent } from '../../../../core/test/mock-component';

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
				StoreModule.forRoot({[layersFeatureKey]: LayersReducer}),
				TranslateModule.forRoot()
			],
			providers: [
				{ provide: layersConfig, useValue: {} },
			]
		})
			.compileComponents();
	}));

	beforeEach(inject([Store], (_store) => {
		fixture = TestBed.createComponent(LayersSearchComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		store = _store;
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
