import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterCounterComponent } from './filter-counter.component';

describe('FilterCounterComponent', () => {
	let component: FilterCounterComponent;
	let fixture: ComponentFixture<FilterCounterComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [FilterCounterComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(FilterCounterComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should display "count" and "filterCount" values', () => {
		const filteredCountSpan = fixture.nativeElement.querySelector('span:first-child');
		const countSpan = fixture.nativeElement.querySelector('span:last-child');
		component.count = 20;
		component.filteredCount = 10;
		fixture.detectChanges();
		expect(countSpan.textContent).toEqual('20');
		expect(filteredCountSpan.textContent).toEqual('10');
	});

});
