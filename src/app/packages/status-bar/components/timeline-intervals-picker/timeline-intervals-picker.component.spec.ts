import { TimelineIntervalsPickerComponent } from './timeline-intervals-picker.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';


describe('TimelineIntervalsPickerComponent', () => {
	let component: TimelineIntervalsPickerComponent;
	let fixture: ComponentFixture<TimelineIntervalsPickerComponent>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [TimelineIntervalsPickerComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(TimelineIntervalsPickerComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('Component Initialised ', () => {
		expect(component).toBeTruthy();
	});
});
