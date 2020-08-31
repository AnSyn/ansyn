import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';

import { SandboxComponent } from './sandbox.component';
import {
	AnsynApi,
	AreaToCredentialsService,
	credentialsConfig,
	OverlayReducer,
	overlaysFeatureKey
} from '@ansyn/ansyn';
import { ImageryCommunicatorService } from '@ansyn/imagery';
import { StoreModule } from '@ngrx/store';
import { HttpClientModule } from "@angular/common/http";
import { TranslateModule } from "@ngx-translate/core";
import { of } from 'rxjs';

describe('SandboxComponent', () => {
	let component: SandboxComponent;
	let fixture: ComponentFixture<SandboxComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [SandboxComponent],
			providers: [
				ImageryCommunicatorService,
				{
					provide: AreaToCredentialsService,
					useValue: {getAreaTriangles: (area) => {
						}
					}
				},
				{
					provide: AnsynApi,
					useValue: {
						events: {
							overlaysLoadedSuccess: of([])
						}
					}
				},
				{
					provide: credentialsConfig,
					useValue: {
						noCredentialsMessage: 'TEST'
					}
				},
			],
			imports: [
				HttpClientModule,
				TranslateModule.forRoot(),
				StoreModule.forRoot({
					[overlaysFeatureKey]: OverlayReducer
				})
			]
		})
			.compileComponents();
	}));

	beforeEach(inject([AreaToCredentialsService], (_areaToCredentialsService: AreaToCredentialsService) => {
		fixture = TestBed.createComponent(SandboxComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
