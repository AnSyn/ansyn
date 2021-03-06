import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ToastComponent } from './toast.component';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { HttpClientModule } from '@angular/common/http';
import { mapFeatureKey, MapReducer } from '../../reducers/map.reducer';
import { TranslateModule } from '@ngx-translate/core';
import { mapFacadeConfig } from '../../models/map-facade.config';

describe('ToastComponent', () => {
	let component: ToastComponent;
	let fixture: ComponentFixture<ToastComponent>;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			imports: [
				HttpClientModule,
				StoreModule.forRoot({
					[mapFeatureKey]: MapReducer
				}),
				EffectsModule.forRoot([]),
				TranslateModule.forRoot()
			],
			declarations: [ToastComponent],
			providers: [
				{
					provide: mapFacadeConfig,
					useValue: {}
				}
			]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ToastComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should be created', () => {
		expect(component).toBeTruthy();
	});
});
