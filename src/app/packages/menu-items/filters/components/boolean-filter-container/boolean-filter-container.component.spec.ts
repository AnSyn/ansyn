import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BooleanFilterContainerComponent } from './boolean-filter-container.component';

describe('BooleanFilterContainerComponent', () => {
	let component: BooleanFilterContainerComponent;
	let fixture: ComponentFixture<BooleanFilterContainerComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [BooleanFilterContainerComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(BooleanFilterContainerComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
