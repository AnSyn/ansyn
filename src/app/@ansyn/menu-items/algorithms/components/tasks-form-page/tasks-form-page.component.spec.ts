import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TasksFormPageComponent } from './tasks-form-page.component';

describe('TasksFormPageComponent', () => {
	let component: TasksFormPageComponent;
	let fixture: ComponentFixture<TasksFormPageComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [TasksFormPageComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(TasksFormPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
