import { TimelineIntervalsPickerComponent } from './timeline-intervals-picker.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

describe('TimelineIntervalsPickerComponent', () => {
	let component: TimelineIntervalsPickerComponent;
	let fixture: ComponentFixture<TimelineIntervalsPickerComponent>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [TimelineIntervalsPickerComponent],
			imports: [
				FormsModule
			]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(TimelineIntervalsPickerComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	// it('Component Initialised ', () => {
	// 	expect(component).toBeTruthy();
	// });
});
