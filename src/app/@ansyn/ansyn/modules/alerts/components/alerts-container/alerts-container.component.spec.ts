import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { mapFacadeConfig, MapFacadeModule, mapFeatureKey, MapReducer } from '@ansyn/map-facade';
import {
	overlayStatusFeatureKey,
	OverlayStatusReducer
} from '../../../overlays/overlay-status/reducers/overlay-status.reducer';
import { ALERTS } from '../../alerts.model';

import { AlertsContainerComponent } from './alerts-container.component';
import { StoreModule } from '@ngrx/store';
import { Observable } from 'rxjs';
import { provideMockActions } from '@ngrx/effects/testing';
import { EffectsModule } from '@ngrx/effects';
import { TranslateModule } from '@ngx-translate/core';

describe('AlertsContainerComponent', () => {
	let component: AlertsContainerComponent;
	let fixture: ComponentFixture<AlertsContainerComponent>;
	let actions: Observable<any>;
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [AlertsContainerComponent],
			imports: [
				MapFacadeModule,
				StoreModule.forRoot({
					[mapFeatureKey]: MapReducer,
					[overlayStatusFeatureKey]: OverlayStatusReducer
				}),
				EffectsModule.forRoot([]),
				TranslateModule.forRoot()],
			providers: [
				{ provide: ALERTS, useValue: [] },
				{ provide: mapFacadeConfig, useValue: {} },
				provideMockActions(() => actions),
			]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(AlertsContainerComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
