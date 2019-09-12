import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TasksFormPageHeaderComponent } from './tasks-form-page-header.component';
import { StoreModule } from '@ngrx/store';
import { tasksFeatureKey, TasksReducer } from '../../reducers/tasks.reducer';
import { TranslateModule } from '@ngx-translate/core';

describe('TasksFormPageHeaderComponent', () => {
	let component: TasksFormPageHeaderComponent;
	let fixture: ComponentFixture<TasksFormPageHeaderComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [TasksFormPageHeaderComponent],
			imports: [
				StoreModule.forRoot({ [tasksFeatureKey]: TasksReducer }),
				TranslateModule.forRoot()
			]
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
