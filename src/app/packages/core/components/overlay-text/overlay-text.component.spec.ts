import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OverlayTextComponent } from './overlay-text.component';

describe('OverlayTextComponent', () => {
	let component: OverlayTextComponent;
	let fixture: ComponentFixture<OverlayTextComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [OverlayTextComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(OverlayTextComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should be created', () => {
		expect(component).toBeTruthy();
	});
});
