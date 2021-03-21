import { ComponentFixture, inject, TestBed, waitForAsync } from '@angular/core/testing';

import { AnnotationLayersComponent } from './annotation-layers.component';
import { ILayerState, layersFeatureKey, LayersReducer } from '../../reducers/layers.reducer';
import { Store, StoreModule } from '@ngrx/store';
import { layersConfig } from '../../services/data-layers.service';
import { TranslateModule } from '@ngx-translate/core';

describe('AnnotationLayersComponent', () => {
	let component: AnnotationLayersComponent;
	let fixture: ComponentFixture<AnnotationLayersComponent>;
	let store: Store<ILayerState>;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			declarations: [AnnotationLayersComponent],
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
		fixture = TestBed.createComponent(AnnotationLayersComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		store = _store;
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
