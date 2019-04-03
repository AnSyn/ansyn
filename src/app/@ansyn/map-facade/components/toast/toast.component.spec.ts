import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ToastComponent } from './toast.component';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { HttpClientModule } from '@angular/common/http';
import { mapFeatureKey, MapReducer } from '../../reducers/map.reducer';

describe('ToastComponent', () => {
	let component: ToastComponent;
	let fixture: ComponentFixture<ToastComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				HttpClientModule,
				StoreModule.forRoot({
					[mapFeatureKey]: MapReducer
				}),
				EffectsModule.forRoot([])
			],
			declarations: [ToastComponent]
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
