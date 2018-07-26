import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditLayerComponent } from './edit-layer.component';
import { FormsModule } from '@angular/forms';
import { DataLayersService, layersConfig } from '../../../services/data-layers.service';
import { HttpClientModule } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { layersFeatureKey, LayersReducer } from '../../../reducers/layers.reducer';
import { ErrorHandlerService } from '../../../../../core/services/error-handler.service';
import { LoggerService } from '../../../../../core/services/logger.service';
import { LoggerConfig } from '../../../../../core/models/logger.config';
import { StorageService } from '../../../../../core/services/storage/storage.service';
import { CoreConfig } from '../../../../../core/models/core.config';

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
			declarations: [EditLayerComponent]
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
