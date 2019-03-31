import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TasksTablePageComponent } from './tasks-table-page.component';
import { MockComponent } from '../../../../core/test/mock-component';

describe('TasksTablePageComponent', () => {
	let component: TasksTablePageComponent;
	let fixture: ComponentFixture<TasksTablePageComponent>;

	const mockHeader = MockComponent({ selector: 'ansyn-tasks-table-page-header' });
	const mockTable = MockComponent({ selector: 'ansyn-tasks-table' });

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [
				TasksTablePageComponent,
				mockHeader,
				mockTable
			]
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
