import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimepickerPresetsComponent } from './timepicker-presets.component';
import { TranslateModule } from '@ngx-translate/core';
import { StoreModule } from '@ngrx/store';
import { LoggerService } from '../../../core/services/logger.service';

describe('TimepickerPresetsComponent', () => {
	let component: TimepickerPresetsComponent;
	let fixture: ComponentFixture<TimepickerPresetsComponent>;



	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [TimepickerPresetsComponent],
			imports: [TranslateModule.forRoot(), StoreModule.forRoot({})],
			providers: [
				{ provide: LoggerService, useValue: {} }
			]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(TimepickerPresetsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
