import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationPickerComponent } from './location-picker.component';

describe('LocationPickerComponent', () => {
	let component: LocationPickerComponent;
	let fixture: ComponentFixture<LocationPickerComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [LocationPickerComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(LocationPickerComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
