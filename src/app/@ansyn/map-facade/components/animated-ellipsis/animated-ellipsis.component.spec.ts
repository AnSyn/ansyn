import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AnimatedEllipsisComponent } from './animated-ellipsis.component';

describe('AnimatedEllipsisComponent', () => {
	let component: AnimatedEllipsisComponent;
	let fixture: ComponentFixture<AnimatedEllipsisComponent>;

	beforeEach(waitForAsync(() => {
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
