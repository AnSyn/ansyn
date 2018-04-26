import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OverlayOverviewComponent } from './overlay-overview.component';

describe('OverlayOverviewComponent', () => {
	let component: OverlayOverviewComponent;
	let fixture: ComponentFixture<OverlayOverviewComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [OverlayOverviewComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(OverlayOverviewComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
