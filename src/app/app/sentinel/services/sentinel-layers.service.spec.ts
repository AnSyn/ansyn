import { HttpClient, HttpClientModule } from '@angular/common/http';
import { inject, TestBed } from '@angular/core/testing';
import { MultipleOverlaysSourceConfig } from '@ansyn/ansyn';
import { StoreModule } from '@ngrx/store';
import { sentinelFeatureKey, SentinelReducer } from '../reducers/sentinel.reducer';
import { SentinelLayersService } from './sentinel-layers.service';
import { of } from 'rxjs';
import { sentinelOverlaySourceConfig } from '../sentinel-source-provider';

describe('SentinelLayersService', () => {
	let httpClient: HttpClient;
	let sentinelLayersService: SentinelLayersService;

	beforeEach(() => TestBed.configureTestingModule({
		imports: [HttpClientModule,
			StoreModule.forRoot({ [sentinelFeatureKey]: SentinelReducer })],
		providers: [{
			provide: sentinelOverlaySourceConfig,
			useValue: { }
		},
			{
				provide: MultipleOverlaysSourceConfig,
				useValue: {
					indexProviders: { SENTINEL: {} }
				}
			}]
	}));

	beforeEach(inject([HttpClient], (_httpClient: HttpClient) => {
		httpClient = _httpClient;
		spyOn(httpClient, 'get').and.callFake(() => of(<any>{}));
	}));

	beforeEach(inject([SentinelLayersService], (_sentinelLayersService: SentinelLayersService) => {
		sentinelLayersService = _sentinelLayersService;
	}));

	it('should be created', () => {
		expect(sentinelLayersService).toBeTruthy();
	});

});
