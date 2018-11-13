import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TasksFormPageHeaderComponent } from './tasks-form-page-header.component';

describe('TasksFormPageHeaderComponent', () => {
	let component: TasksFormPageHeaderComponent;
	let fixture: ComponentFixture<TasksFormPageHeaderComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [TasksFormPageHeaderComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(TasksFormPageHeaderComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
