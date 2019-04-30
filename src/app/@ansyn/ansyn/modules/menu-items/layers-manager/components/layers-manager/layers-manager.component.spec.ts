import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { LayersManagerModule } from '../../layers-manager.module';
import { LayersManagerComponent } from './layers-manager.component';
import { StoreModule } from '@ngrx/store';
import { DataLayersService, layersConfig } from '../../services/data-layers.service';
import { layersFeatureKey, LayersReducer } from '../../reducers/layers.reducer';
import { HttpClientModule } from '@angular/common/http';
import { EffectsModule } from '@ngrx/effects';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CoreConfig } from '../../../../core/models/core.config';
import { LoggerService } from '../../../../core/services/logger.service';
import { LoggerConfig } from '../../../../core/models/logger.config';
import { casesFeatureKey, CasesReducer } from '../../../../../../../app/cases/reducers/cases.reducer';

describe('LayersManagerComponent', () => {
	let component: LayersManagerComponent;
	let fixture: ComponentFixture<LayersManagerComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				LayersManagerModule,
				HttpClientModule,
				BrowserAnimationsModule,
				EffectsModule.forRoot([]),
				StoreModule.forRoot({
					[layersFeatureKey]: LayersReducer,
					[casesFeatureKey]: CasesReducer
				})
			],
			providers: [
				{ provide: layersConfig, useValue: { schema: null } },
				{ provide: LoggerConfig, useValue: {} },
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
