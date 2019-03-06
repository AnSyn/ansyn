import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditLayerComponent } from './edit-layer.component';
import { FormsModule } from '@angular/forms';
import { DataLayersService, layersConfig } from '../../../services/data-layers.service';
import { HttpClientModule } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { layersFeatureKey, LayersReducer } from '../../../reducers/layers.reducer';
import {
	AnsynInputComponent,
	CoreConfig,
	ErrorHandlerService,
	LoggerConfig,
	LoggerService,
	StorageService
} from '@ansyn/core';
import { MatInputModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('EditLayerComponent', () => {
	let component: EditLayerComponent;
	let fixture: ComponentFixture<EditLayerComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [FormsModule, HttpClientModule, MatInputModule, BrowserAnimationsModule, StoreModule.forRoot({ [layersFeatureKey]: LayersReducer })],
			providers: [
				{ provide: StorageService, useValue: {} },
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
