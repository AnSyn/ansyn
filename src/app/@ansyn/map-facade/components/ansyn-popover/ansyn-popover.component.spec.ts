import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AnsynPopoverComponent } from './ansyn-popover.component';

describe('AnsynPopoverComponent', () => {
	let component: AnsynPopoverComponent;
	let fixture: ComponentFixture<AnsynPopoverComponent>;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			declarations: [AnsynPopoverComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(AnsynPopoverComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
