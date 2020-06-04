import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArrayFilterContainerComponent } from './array-filter-container.component';
import { FilterCounterComponent } from '../filter-counter/filter-counter.component';
import { ArrayFilterMetadata } from '../../models/metadata/array-filter-metadata';
import { ArrayFilterCounters } from '../../models/counters/array-filter-counters';

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
		component.metadata = {
			fields: new Map([['one', false], ['two', true]]),
			count: 10,
		} as ArrayFilterMetadata;
		component.counters = {
			filteredCount: 5
		} as ArrayFilterCounters;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
