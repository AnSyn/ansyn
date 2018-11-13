import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlgorithmsComponent } from './algorithms.component';
import { MockComponent } from '@ansyn/core';

describe('AlgorithmsComponent', () => {
	let component: AlgorithmsComponent;
	let fixture: ComponentFixture<AlgorithmsComponent>;

	const mockTablePage = MockComponent({ selector: 'ansyn-tasks-table-page' });
	const mockFormPage = MockComponent({ selector: 'ansyn-tasks-form-page' });

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [
				AlgorithmsComponent,
				mockTablePage,
				mockFormPage
			]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(AlgorithmsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
