import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TasksComponent } from './tasks.component';
import { MockComponent } from '@ansyn/core';

describe('TasksComponent', () => {
	let component: TasksComponent;
	let fixture: ComponentFixture<TasksComponent>;

	const mockTablePage = MockComponent({ selector: 'ansyn-tasks-table-page' });
	const mockFormPage = MockComponent({ selector: 'ansyn-tasks-form-page' });

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [
				TasksComponent,
				mockTablePage,
				mockFormPage
			]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(TasksComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
