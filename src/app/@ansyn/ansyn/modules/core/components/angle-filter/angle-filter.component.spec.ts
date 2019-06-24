import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AngleFilterComponent } from './angle-filter.component';

describe('AngleFilterComponent', () => {
	let component: AngleFilterComponent;
	let fixture: ComponentFixture<AngleFilterComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [AngleFilterComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(AngleFilterComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
