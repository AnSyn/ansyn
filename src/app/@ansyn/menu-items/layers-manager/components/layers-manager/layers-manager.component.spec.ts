import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { LayersManagerModule } from '../../layers-manager.module';
import { LayersManagerComponent } from './layers-manager.component';
import { StoreModule } from '@ngrx/store';
import { DataLayersService, layersConfig } from '../../services/data-layers.service';
import { layersFeatureKey, LayersReducer } from '../../reducers/layers.reducer';
import { HttpClientModule } from '@angular/common/http';
import { EffectsModule } from '@ngrx/effects';
import { LoggerService } from '@ansyn/core/services/logger.service';
import { CoreConfig } from '@ansyn/core/models/core.config';

describe('LayersManagerComponent', () => {
	let component: LayersManagerComponent;
	let fixture: ComponentFixture<LayersManagerComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				LayersManagerModule,
				HttpClientModule,
				EffectsModule.forRoot([]),
				StoreModule.forRoot({ [layersFeatureKey]: LayersReducer })
			],
			providers: [
				{ provide: layersConfig, useValue: { schema: null } },
				{ provide: LoggerService, useValue: { error: (some) => null } },
				{ provide: CoreConfig, useValue: {} }
			]
		})
			.compileComponents();
	}));

	beforeEach(inject([DataLayersService], (_dataLayersService: DataLayersService) => {
		spyOn(_dataLayersService, 'getAllLayersInATree');
		fixture = TestBed.createComponent(LayersManagerComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
