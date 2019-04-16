import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimatedEllipsisComponent } from './animated-ellipsis.component';

describe('AnimatedEllipsisComponent', () => {
	let component: AnimatedEllipsisComponent;
	let fixture: ComponentFixture<AnimatedEllipsisComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [AnimatedEllipsisComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(AnimatedEllipsisComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
