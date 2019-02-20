import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { StoreModule } from '@ngrx/store';
import { layersFeatureKey, LayersReducer } from '../../reducers/layers.reducer';
import { LayerCollectionComponent } from './layer-collection.component';
import { MockComponent } from '@ansyn/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('LayerCollectionComponent', () => {
	let component: LayerCollectionComponent;
	let fixture: ComponentFixture<LayerCollectionComponent>;
	const ansynImportLayerComponent = MockComponent({ selector: 'ansyn-import-layer' });
	const ansynLayerComponent = MockComponent({ selector: 'ansyn-layer', inputs: ['layer', 'showOnly'] });
	const ansynLayerMenuComponent = MockComponent({ selector: 'ansyn-layer-menu', inputs: ['disabledRemove'], outputs: ['openModal'] });

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				BrowserAnimationsModule,
				StoreModule.forRoot({ [layersFeatureKey]: LayersReducer })
			],
			declarations: [
				LayerCollectionComponent,
				ansynImportLayerComponent,
				ansynLayerComponent,
				ansynLayerMenuComponent
			]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(LayerCollectionComponent);
		component = fixture.componentInstance;
		component.collection = <any> { type: 'what' };
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
