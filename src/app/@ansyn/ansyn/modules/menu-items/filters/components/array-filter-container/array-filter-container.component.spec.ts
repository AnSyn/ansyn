import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArrayFilterContainerComponent } from './array-filter-container.component';

describe('ArrayFilterContainerComponent', () => {
	let component: ArrayFilterContainerComponent;
	let fixture: ComponentFixture<ArrayFilterContainerComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ArrayFilterContainerComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ArrayFilterContainerComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
