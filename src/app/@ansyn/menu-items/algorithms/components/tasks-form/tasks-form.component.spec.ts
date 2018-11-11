import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TasksFormComponent } from './tasks-form.component';
import { FormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { MockComponent, Overlay } from '@ansyn/core';
import { TranslateModule } from '@ngx-translate/core';
import { AlgorithmsConfigService } from '../../services/algorithms-config.service';
import { EffectsModule } from '@ngrx/effects';
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
				TranslateModule.forRoot(),
				StoreModule.forRoot({}),
				EffectsModule.forRoot([])
			],
			providers: [
				{
					provide: AlgorithmsConfigService,
					useValue: {
						config: {}
					}
				},
				{
					provide: AlgorithmsService,
					useValue: {}
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

	describe('checkForErrors()', () => {
		let overlays: Overlay[];
		beforeEach(() => {
			spyOn(component, 'showError');
			overlays = ['a', 'b'].map((id) => new Overlay({id: id}));
			component.MIN_NUM_OF_OVERLAYS = 2;
			component.configService.config = {
				maxOverlays: 3,
				timeEstimationPerOverlayInMinutes: 10,
				regionLengthInMeters: 100,
				sensorNames: []
			};
			component.task = {
				id: '21',
				name: '21',
				overlays: overlays,
				masterOverlay: overlays[0],
				region: {
					type: 'Point'
				}
			}
		});
		it('should set empty message by default', () => {
			console.log('hehe');
			component.checkForErrors();
			expect(component.showError).toHaveBeenCalledWith('');
		});
		// it('should check minimum no. of overlays', () => {
		// 	overlays.pop();
		// 	component.checkForErrors();
		// 	expect(component.showError).toHaveBeenCalledWith(`The number of selected overlays is less than ${component.MIN_NUM_OF_OVERLAYS}`);
		// });
	});
});
