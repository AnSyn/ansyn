import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TimePickerContainerComponent } from './time-picker-container.component';
import { StoreModule } from '@ngrx/store';
import { StatusBarConfig } from '../../models/statusBar.config';
import { TranslateModule } from '@ngx-translate/core';
import { MockDirective } from '../../../core/test/mock-directive';
import { MockComponent } from '../../../core/test/mock-component';

describe('TimePickerContainerComponent', () => {
	let component: TimePickerContainerComponent;
	let fixture: ComponentFixture<TimePickerContainerComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [
				TimePickerContainerComponent,
				MockDirective({
					selector: '[ansynClickOutside]',
					inputs: ['extraClass', 'trigger']
				}),
				MockComponent({
					selector: 'button[ansynComboBoxTrigger]',
					inputs: ['isActive', 'render', 'ngModel', 'owlDateTimeTrigger', 'withArrow'],
					outputs: ['ngModelChange']
				})
			],
			imports: [StoreModule.forRoot({}), TranslateModule.forRoot()],
			providers: [
				{ provide: StatusBarConfig, useValue: {} }
			]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(TimePickerContainerComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
