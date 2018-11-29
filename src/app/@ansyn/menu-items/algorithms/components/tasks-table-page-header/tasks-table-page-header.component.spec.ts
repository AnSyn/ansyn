import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TasksTablePageHeaderComponent } from './tasks-table-page-header.component';
import { StoreModule } from '@ngrx/store';
import { tasksFeatureKey, TasksReducer } from '../../reducers/tasks.reducer';

describe('TasksTablePageHeaderComponent', () => {
	let component: TasksTablePageHeaderComponent;
	let fixture: ComponentFixture<TasksTablePageHeaderComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [TasksTablePageHeaderComponent],
			imports: [
				StoreModule.forRoot({ [tasksFeatureKey]: TasksReducer }),
			]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(TasksTablePageHeaderComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
