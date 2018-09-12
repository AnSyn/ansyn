import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditLayerComponent } from './edit-layer.component';
import { FormsModule } from '@angular/forms';
import { DataLayersService, layersConfig } from '../../../services/data-layers.service';
import { HttpClientModule } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { layersFeatureKey, LayersReducer } from '../../../reducers/layers.reducer';
import { StorageService } from '@ansyn/core';
import { ErrorHandlerService } from '@ansyn/core';
import { LoggerService } from '@ansyn/core';
import { CoreConfig } from '@ansyn/core';
import { LoggerConfig } from '@ansyn/core';
import { AnsynInputComponent } from '@ansyn/core';

describe('EditLayerComponent', () => {
	let component: EditLayerComponent;
	let fixture: ComponentFixture<EditLayerComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [FormsModule, HttpClientModule, StoreModule.forRoot({ [layersFeatureKey]: LayersReducer })],
			providers: [
				StorageService,
				DataLayersService,
				ErrorHandlerService,
				LoggerService,
				{ provide: layersConfig, useValue: {} },
				{ provide: CoreConfig, useValue: {} },
				{ provide: LoggerConfig, useValue: {} }
			],
			declarations: [EditLayerComponent, AnsynInputComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(EditLayerComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
