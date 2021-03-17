import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UnsupportedDevicesComponent } from './unsupported-devices.component';

describe('UnsupportedDevicesComponent', () => {
	let component: UnsupportedDevicesComponent;
	let fixture: ComponentFixture<UnsupportedDevicesComponent>;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			declarations: [UnsupportedDevicesComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(UnsupportedDevicesComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
