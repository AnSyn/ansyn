import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TasksTablePageComponent } from './tasks-table-page.component';

describe('TasksTablePageComponent', () => {
	let component: TasksTablePageComponent;
	let fixture: ComponentFixture<TasksTablePageComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [TasksTablePageComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(TasksTablePageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
