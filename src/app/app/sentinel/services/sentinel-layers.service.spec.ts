import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MultipleOverlaysSourceConfig } from "@ansyn/ansyn";
import { MAP_SOURCE_PROVIDERS_CONFIG } from "@ansyn/imagery";
import { StoreModule } from '@ngrx/store';
import { sentinelFeatureKey, SentinelReducer } from "../reducers/sentinel.reducer";


import { SentinelLayersService } from './sentinel-layers.service';

describe('SentinelLayersService', () => {
	beforeEach(() => TestBed.configureTestingModule({
		imports: [HttpClientModule,
			StoreModule.forRoot({[sentinelFeatureKey]: SentinelReducer})],
		providers: [{
			provide: MAP_SOURCE_PROVIDERS_CONFIG,
			useValue: {SENTINEL: {}}
		},
			{
				provide: MultipleOverlaysSourceConfig,
				useValue: {
					indexProviders: {SENTINEL: {}}
				}
			}]
	}));

	it('should be created', () => {
		const service: SentinelLayersService = TestBed.get(SentinelLayersService);
		expect(service).toBeTruthy();
	});
});
