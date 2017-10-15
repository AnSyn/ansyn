import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OverlayGeoRegistrationErrorComponent } from './overlay-geo-registration-error.component';

describe('OverlayGeoRegistrationErrorComponent', () => {
	let component: OverlayGeoRegistrationErrorComponent;
	let fixture: ComponentFixture<OverlayGeoRegistrationErrorComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [OverlayGeoRegistrationErrorComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(OverlayGeoRegistrationErrorComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should be created', () => {
		expect(component).toBeTruthy();
	});
});
