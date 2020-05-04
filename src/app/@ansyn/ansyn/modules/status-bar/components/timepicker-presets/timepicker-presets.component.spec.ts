import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimepickerPresetsComponent } from './timepicker-presets.component';
import { TranslateModule } from '@ngx-translate/core';
import { MockComponent } from '../../../core/test/mock-component';
import { StoreModule } from '@ngrx/store';

describe('TimepickerPresetsComponent', () => {
	let component: TimepickerPresetsComponent;
	let fixture: ComponentFixture<TimepickerPresetsComponent>;

	const ansynComboTrigger = MockComponent({
		selector: 'button[ansynComboBoxTrigger]',
		inputs: ['isActive', 'render', 'ngModel', 'owlDateTimeTrigger', 'withArrow'],
		outputs: ['ngModelChange']
	});

	const ansynTimePicker = MockComponent({
		selector: 'ansyn-timepicker',
		inputs: ['timeRange', 'extraClass', 'trigger'],
		outputs: ['closeTimePicker', 'ansynClickOutside']
	});

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [TimepickerPresetsComponent, ansynComboTrigger, ansynTimePicker],
			imports: [TranslateModule.forRoot(), StoreModule.forRoot({})]
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
