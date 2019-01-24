import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeotiffDatetimePickerComponent } from './geotiff-datetime-picker.component';

describe('GeotiffDatetimePickerComponent', () => {
	let component: GeotiffDatetimePickerComponent;
	let fixture: ComponentFixture<GeotiffDatetimePickerComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [GeotiffDatetimePickerComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(GeotiffDatetimePickerComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
