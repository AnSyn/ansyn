import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TasksFormComponent } from './tasks-form.component';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MockComponent } from '@ansyn/core';
import { TranslateModule } from '@ngx-translate/core';
import { AlgorithmsService } from '../../services/algorithms.service';

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
		inputs: ['ngModel', 'value', 'required', 'white'],
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
			imports: [
				FormsModule,
				TranslateModule.forRoot()
			],
			providers: [
				{
					provide: AlgorithmsService,
					useValue: {}
				},
				{
					provide: Store,
					useValue: {
						select: () => ({
							pipe: () => ({})
						}),
						pipe: () => ({})
					}
				}
			]
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
