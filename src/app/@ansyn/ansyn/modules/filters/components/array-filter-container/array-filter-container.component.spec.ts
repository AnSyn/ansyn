import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArrayFilterContainerComponent } from './array-filter-container.component';
import { FilterCounterComponent } from '../filter-counter/filter-counter.component';

describe('ArrayFilterContainerComponent', () => {
	let component: ArrayFilterContainerComponent;
	let fixture: ComponentFixture<ArrayFilterContainerComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ArrayFilterContainerComponent, FilterCounterComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ArrayFilterContainerComponent);
		component = fixture.componentInstance;
		component.metadata = <any>{
			fields: new Map([['one', false], ['two', true]]),
			count: 10,
			filteredCount: 5
		};
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
