import { TimelineTimepickerComponent } from './timeline-timepicker.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatusBarModule } from '../../status-bar.module';
import { StoreModule } from '@ngrx/store';


describe('TimelineTimepickerComponent', () => {
	let component: TimelineTimepickerComponent;
	let fixture: ComponentFixture<TimelineTimepickerComponent>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [StoreModule.forRoot([]), StatusBarModule],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(TimelineTimepickerComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('Component Initialised ', () => {
		expect(component).toBeTruthy();
	});

	it(' open the timepicker', () => {

		expect(component.endDatePickerInstance.isOpen).toBe(false);
		component.endDatePickerInstance.open();
		expect(component.endDatePickerInstance.isOpen).toBe(true);

		expect(component.startDatePickerInstance.isOpen).toBe(false);
		component.startDatePickerInstance.open();
		expect(component.startDatePickerInstance.isOpen).toBe(true);
	});

	it('ngOnInit - check that both instances are avilable and one with start id and the second with end id', () => {
		// expect(true).toBe(false);
		expect(component.endDatePickerInstance).toBeTruthy();
		expect(component.startDatePickerInstance).toBeTruthy();

	});

	it('selectedDateChanged', () => {
		const date = new Date();

		component.endDatePickerInstance.setDate(date, true);
		expect(component.endDatePickerValue.toString()).toEqual(date.toString());

		component.startDatePickerInstance.setDate(date, true);
		expect(component.startDatePickerValue.toString()).toEqual(date.toString());

	});

	it('cancelTimepickerEvent click on cancel', () => {
		spyOn(component.closeComponent, 'emit');
		fixture.nativeElement.querySelector('.timelinepicker-cancel').click();
		expect(component.closeComponent.emit).toHaveBeenCalled();
	});

	it('applyTimepickerEvent click on apply when start date is later then end date', () => {
		const today = new Date();
		const lastYear = new Date(new Date().getTime() - 3600000 * 24 * 365);
		spyOn(component.applyDate, 'emit');
		component.startDatePickerInstance.setDate(today, true);
		component.endDatePickerInstance.setDate(lastYear, true);
		fixture.nativeElement.querySelector('.timelinepicker-apply').click();
		expect(component.applyDate.emit).not.toHaveBeenCalled();
		expect(component.error).not.toEqual('');
	});

	it('applyTimepickerEvent click on apply when start date is earlier then end date', () => {
		const today = new Date();
		const lastYear = new Date(new Date().getTime() - 3600000 * 24 * 365);
		spyOn(component.applyDate, 'emit');
		component.startDatePickerInstance.setDate(lastYear, true);
		component.endDatePickerInstance.setDate(today, true);
		fixture.nativeElement.querySelector('.timelinepicker-apply').click();
		expect(component.applyDate.emit).toHaveBeenCalled();
		expect(component.error).toBe('');
	});

});
