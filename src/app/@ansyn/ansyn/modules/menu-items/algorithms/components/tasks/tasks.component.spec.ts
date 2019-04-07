import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TasksComponent } from './tasks.component';
import { MockComponent } from '../../../../core/test/mock-component';
import { StoreModule } from '@ngrx/store';
import { tasksFeatureKey, TasksReducer } from '../../reducers/tasks.reducer';

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
			],
			imports: [
				StoreModule.forRoot({ [tasksFeatureKey]: TasksReducer }),
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
