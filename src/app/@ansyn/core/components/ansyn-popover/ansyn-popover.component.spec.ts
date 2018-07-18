import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnsynPopoverComponent } from './ansyn-popover.component';

describe('AnsynPopoverComponent', () => {
	let component: AnsynPopoverComponent;
	let fixture: ComponentFixture<AnsynPopoverComponent>;

	beforeEach(async(() => {
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
