import { async, ComponentFixture, TestBed, inject, tick, fakeAsync } from '@angular/core/testing';

import { TimePickerComponent } from './time-picker.component';
import {
	ICaseTimeState,
	MockComponent,
	OverlayReducer,
	overlaysFeatureKey,
	SetOverlaysCriteriaAction
} from '@ansyn/ansyn';
import { StoreModule, Store } from '@ngrx/store';
import { DateTimeAdapter } from '@ansyn/ng-pick-datetime';

const mockTimePickerTrigger = MockComponent({
	selector: 'input[timePickerInput]',
	inputs: ['selectMode', 'ngModel', 'owlDateTime'],
	outputs: ['ngModelChange', 'dateTimeChange']
});
const mockOwlDateTime = MockComponent({
	selector: 'owl-date-time',
	inputs: ['backdropClass'],
	outputs: ['afterPickerClosed']
});

describe('TimepickerComponent', () => {
	let component: TimePickerComponent;
	let fixture: ComponentFixture<TimePickerComponent>;
	let store: Store<any>;
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [TimePickerComponent, mockOwlDateTime, mockTimePickerTrigger],
			imports: [StoreModule.forRoot({
				[overlaysFeatureKey]: OverlayReducer
			})],
			providers: [
				DateTimeAdapter
			]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(TimePickerComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	beforeEach(inject([Store], (_store: Store<any>) => {
		store = _store;
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('onSelectTime fire SetOverlaysCriteriaAction action' , fakeAsync(() => {
		spyOn(store, 'dispatch');
		const startDate = new Date();
		const endDate = new Date(startDate.getTime() + 60000);
		const time: ICaseTimeState = {
			from: startDate,
			to: endDate,
			type: 'absolute'
		};
		component.onTimeRangeChange({value: [startDate, endDate]});
		tick();
		expect(store.dispatch).toHaveBeenCalledWith(new SetOverlaysCriteriaAction({time}));
	}))
});