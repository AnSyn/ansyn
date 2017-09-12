import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OverlaysStatusNotificationsComponent } from './overlays-status-notifications.component';

describe('OverlaysStatusNotificationsComponent', () => {
	let component: OverlaysStatusNotificationsComponent;
	let fixture: ComponentFixture<OverlaysStatusNotificationsComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [OverlaysStatusNotificationsComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(OverlaysStatusNotificationsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should be created', () => {
		expect(component).toBeTruthy();
	});
});
