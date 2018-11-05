import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TasksFormComponent } from './tasks-form.component';
import { FormsModule } from '@angular/forms';
import { CoreModule } from '../../../../core/core.module';
import { StoreModule } from '@ngrx/store';
import { coreFeatureKey, CoreReducer } from '../../../../core/reducers/core.reducer';
import { EffectsModule } from '@ngrx/effects';
import { MockComponent } from '@ansyn/core';

describe('TasksFormComponent', () => {
	let component: TasksFormComponent;
	let fixture: ComponentFixture<TasksFormComponent>;

	const mockComboBoxOptionComponent = MockComponent({
		selector: 'ansyn-combo-box-option',
		inputs: ['value'],
		outputs: []
	});

	const mockComboBoxComponent = MockComponent({
		selector: 'ansyn-combo-box',
		inputs: ['options', 'renderFunction', 'comboBoxToolTipDescription', 'ngModel', 'color', 'placeholder'],
		outputs: ['ngModelChange']
	});

	const mockComboTrigger = MockComponent({
		selector: 'button[ansynComboBoxTrigger]',
		inputs: ['isActive', 'render', 'ngModel'],
		outputs: ['ngModelChange']
	});

	const mockRadioBtn = MockComponent({
		selector: 'ansyn-radio',
		inputs: ['ngModel', 'value'],
		outputs: ['ngModelChange']
	});

	const mockInput = MockComponent({
		selector: 'ansyn-input',
		inputs: ['ngModel', 'value', 'required'],
		outputs: ['ngModelChange']
	});

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [
				TasksFormComponent,
				mockComboBoxComponent,
				mockComboBoxOptionComponent,
				mockComboTrigger,
				mockRadioBtn,
				mockInput
			],
			imports: []
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(TasksFormComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
