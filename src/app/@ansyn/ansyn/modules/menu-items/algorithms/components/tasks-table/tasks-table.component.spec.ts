import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { TasksTableComponent } from './tasks-table.component';
import { Store, StoreModule } from '@ngrx/store';
import { ITasksState, tasksFeatureKey, TasksReducer } from '../../reducers/tasks.reducer';
import { DeleteTaskAction, LoadTasksAction } from '../../actions/tasks.actions';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { EffectsModule } from '@ngrx/effects';
import { TasksService } from '../../services/tasks.service';
import { mapFacadeConfig } from '@ansyn/map-facade';
import { TasksRemoteService } from '../../services/tasks-remote.service';
import { MenuConfig } from '@ansyn/menu';
import { TranslateModule } from '@ngx-translate/core';
import { TasksEffects } from '../../effects/tasks.effects';
import { of } from 'rxjs/index';
import { CoreConfig } from '../../../../core/models/core.config';
import { LoggerConfig } from '../../../../core/models/logger.config';
import { MockComponent } from '../../../../core/test/mock-component';

describe('TasksTableComponent', () => {
	let component: TasksTableComponent;
	let fixture: ComponentFixture<TasksTableComponent>;
	let store: Store<ITasksState>;

	const mockLoader = MockComponent({ selector: 'ansyn-loader', inputs: ['show'] });
	const mockModal = MockComponent({ selector: 'ansyn-modal', inputs: ['show'] });
	const mockRemove = MockComponent({ selector: 'ansyn-remove-task-modal', inputs: ['message'] });

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [
				TasksTableComponent,
				mockLoader,
				mockModal,
				mockRemove
			],
			imports: [
				HttpClientModule,
				EffectsModule.forRoot([]),
				StoreModule.forRoot({ [tasksFeatureKey]: TasksReducer }),
				TranslateModule.forRoot(),
				RouterTestingModule
			],
			providers: [
				{
					provide: TasksService, useValue: {
						loadTasks: () => {}
					}
				},
				{
					provide: TasksEffects, useValue: {
						onAddTask$: of(null)
					}
				},
				{ provide: TasksRemoteService, useValue: {} },
				{ provide: LoggerConfig, useValue: {} },
				{ provide: CoreConfig, useValue: {} },
				{ provide: mapFacadeConfig, useValue: {} },
				{ provide: MenuConfig, useValue: {} },
			]
		})
			.compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<ITasksState>) => {
		spyOn(_store, 'dispatch');
		fixture = TestBed.createComponent(TasksTableComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		store = _store;
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('loadTasks should call tasksService.loadTasks()', () => {
		component.loadTasks();
		expect(store.dispatch).toHaveBeenCalledWith(new LoadTasksAction());
	});

	it('onTasksAdded should change tbodyElement scrollTop to 0( only if tbodyElement is not undefined )', () => {
		component.tbodyElement = <any> {
			nativeElement: { scrollTop: 100 }
		};
		component.onTasksAdded();
		expect(component.tbodyElement.nativeElement.scrollTop).toEqual(0);
	});

	it('onMouseEnterTaskRow should calc the top of taskMenu and add "mouse-enter" class', () => {
		let taskMenu = <HTMLDivElement> { style: { top: '-1px' } };
		const taskRow = <HTMLDivElement> {
			offsetTop: 100, classList: jasmine.createSpyObj({
				add: () => null
			})
		};
		const tbodyElement = <HTMLDivElement> { scrollTop: 50 };
		component.onMouseEnterTaskRow(taskMenu, taskRow, tbodyElement);
		expect(taskMenu.style.top).toEqual('51px');
		expect(taskRow.classList.add).toHaveBeenCalledWith('mouse-enter');
	});

	it('onMouseLeaveTaskRow should remove "mouse-enter" class', () => {
		const taskRow = <HTMLDivElement> {
			classList: jasmine.createSpyObj({
				remove: () => null
			})
		};
		component.onMouseLeaveTaskRow(taskRow);
		expect(taskRow.classList.remove).toHaveBeenCalledWith('mouse-enter');
	});

	it('taskMenuClick should call stopPropagation() and remove mouse-enter class from taskRow', () => {
		const $event = jasmine.createSpyObj({ stopPropagation: () => null });
		const taskRow = <HTMLDivElement> {
			classList: jasmine.createSpyObj({
				remove: () => null
			})
		};
		component.taskMenuClick($event, taskRow);
		expect($event.stopPropagation).toHaveBeenCalled();
		expect(taskRow.classList.remove).toHaveBeenCalledWith('mouse-enter');
	});

	it('removeTask should dispatch DeleteTaskAction', () => {
		let selectedTaskId = 'fakeSelectedTaskId';
		component.removeTask(selectedTaskId);
		expect(store.dispatch).toHaveBeenCalledWith(new DeleteTaskAction(selectedTaskId));
	});

});
