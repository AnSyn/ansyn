import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ToastComponent } from './toast.component';
import { CoreModule } from '../../core.module';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { LoggerConfig } from '../../models/logger.config';

describe('ToastComponent', () => {
	let component: ToastComponent;
	let fixture: ComponentFixture<ToastComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				StoreModule.forRoot({}),
				EffectsModule.forRoot([]),
				CoreModule
			],
			providers: [{ provide: LoggerConfig, useValue: {} }]
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
