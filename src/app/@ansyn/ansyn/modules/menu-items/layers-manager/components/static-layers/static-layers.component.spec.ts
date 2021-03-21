import { ComponentFixture, inject, TestBed, waitForAsync } from '@angular/core/testing';

import { StaticLayersComponent } from './static-layers.component';
import { ILayerState, layersFeatureKey, LayersReducer } from '../../reducers/layers.reducer';
import { Store, StoreModule } from '@ngrx/store';
import { layersConfig } from '../../services/data-layers.service';
import { TranslateModule } from '@ngx-translate/core';

describe('StaticLayersComponent', () => {
	let component: StaticLayersComponent;
	let fixture: ComponentFixture<StaticLayersComponent>;
	let store: Store<ILayerState>;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			declarations: [StaticLayersComponent],
			imports: [
				StoreModule.forRoot({[layersFeatureKey]: LayersReducer}),
				TranslateModule.forRoot()
			],
			providers: [
				{ provide: layersConfig, useValue: {} },
			]
		}).compileComponents();
	}));

	beforeEach(inject([Store], (_store) => {
		fixture = TestBed.createComponent(StaticLayersComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		store = _store;
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
