import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { TasksTableComponent } from './tasks-table.component';
import { Store, StoreModule } from '@ngrx/store';
import { ITasksState, tasksFeatureKey, TasksReducer } from '../../reducers/tasks.reducer';
import { TasksModule } from '../../tasks.module';
import { LoadTasksAction } from '../../actions/tasks.actions';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { EffectsModule } from '@ngrx/effects';
import { CoreConfig, LoggerConfig } from '@ansyn/core';
import { DataLayersService, layersConfig } from '../../../layers-manager/services/data-layers.service';
import { TasksService } from '../../services/tasks.service';
import { DeleteCaseAction } from '../../../cases/actions/cases.actions';

describe('TasksTableComponent', () => {
	let component: TasksTableComponent;
	let fixture: ComponentFixture<TasksTableComponent>;
	let store: Store<ITasksState>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				HttpClientModule,
				TasksModule,
				EffectsModule.forRoot([]),
				StoreModule.forRoot({ [tasksFeatureKey]: TasksReducer }),
				RouterTestingModule
			],
			providers: [
				DataLayersService,
				{ provide: TasksService, useValue: { schema: null } },
				{ provide: LoggerConfig, useValue: {} },
				{ provide: CoreConfig, useValue: {} },
				{ provide: layersConfig, useValue: {} }
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

	it('removeTask should open modal with DeleteTaskComponent', () => {
		let selectedTaskId = 'fakeSelectedTaskId';
		component.removeTask(selectedTaskId);
		expect(store.dispatch).toHaveBeenCalledWith(new DeleteCaseAction(selectedTaskId));
	});

});
