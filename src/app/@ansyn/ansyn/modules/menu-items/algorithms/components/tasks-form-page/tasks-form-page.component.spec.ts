import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TasksFormPageComponent } from './tasks-form-page.component';
import { MockComponent } from '../../../../core/test/mock-component';

describe('TasksFormPageComponent', () => {
	let component: TasksFormPageComponent;
	let fixture: ComponentFixture<TasksFormPageComponent>;

	const mockHeader = MockComponent({ selector: 'ansyn-tasks-form-page-header' });
	const mockTable = MockComponent({ selector: 'ansyn-tasks-form' });

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			declarations: [
				TasksFormPageComponent,
				mockHeader,
				mockTable
			]
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
