import { TasksEffects } from './tasks.effects';
import { async, inject, TestBed } from '@angular/core/testing';
import { TasksService } from '../services/tasks.service';
import { Store, StoreModule } from '@ngrx/store';
import { tasksFeatureKey, TasksReducer } from '../reducers/tasks.reducer';
import { Observable, of, throwError } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { provideMockActions } from '@ngrx/effects/testing';
import { cold, hot } from 'jasmine-marbles';
import { AlgorithmsConfig, AlgorithmTask, AlgorithmTaskStatus } from '../models/tasks.model';
import {
	AddTaskAction,
	AddTasksAction,
	DeleteTaskAction,
	LoadTasksAction,
	LoadTasksFinishedAction,
	SelectTaskAction
} from '../actions/tasks.actions';
import { TasksRemoteService } from '../services/tasks-remote.service';
import { CoreConfig } from '../../../core/models/core.config';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { LoggerService } from '../../../core/services/logger.service';
import { StorageService } from '../../../core/services/storage/storage.service';

describe('TasksEffects', () => {
	let tasksEffects: TasksEffects;
	let tasksService: TasksService;
	let loggerService: LoggerService;
	let actions: Observable<any>;
	let store: Store<any>;

	const taskMock: AlgorithmTask = {
		id: 'task1',
		name: 'name',
		owner: 'owner',
		creationTime: new Date(),
		lastModified: new Date(),
		state: {
			maps: {
				activeMapId: '5555',
				data: [
					{
						id: '5555',
						data: {}

					},
					{
						id: '4444',
						data: {}
					}
				]
			},
			favoriteOverlays: ['2']
		}
	} as any;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				HttpClientModule,
				StoreModule.forRoot({ [tasksFeatureKey]: TasksReducer }),
				RouterTestingModule
			],
			providers: [
				TasksEffects,
				StorageService,
				{
					provide: TasksService,
					useValue: {
						loadTasks: () => {
						},
						createTask: () => {
						},
						removeTask: () => {
						}
					}
				},
				{
					provide: ErrorHandlerService,
					useValue: { httpErrorHandle: () => throwError(null) }
				},
				provideMockActions(() => actions),
				{ provide: LoggerService, useValue: {} },
				{ provide: CoreConfig, useValue: { storageService: { baseUrl: 'fake-base-url' } } },
				{ provide: AlgorithmsConfig, useValue: {} },
				{ provide: TasksRemoteService, useValue: {} }
			]
		}).compileComponents();
	}));

	beforeEach(inject([Store, LoggerService, TasksEffects, TasksService],
		(_store: Store<any>, _loggerService: LoggerService, _tasksEffects: TasksEffects, _tasksService: TasksService) => {
			store = _store;
			loggerService = _loggerService;
			tasksEffects = _tasksEffects;
			tasksService = _tasksService;
		}));

	it('should be defined', () => {
		expect(tasksEffects).toBeDefined();
	});

	it('loadTasks$ should call tasksService.loadTasks with task lastId from state, and return LoadTasksFinishedAction', () => {
		let loadedTasks: AlgorithmTask[] = [{ ...taskMock, id: 'loadedTask1' }, {
			...taskMock,
			id: 'loadedTask2'
		}, { ...taskMock, id: 'loadedTask1' }];
		spyOn(tasksService, 'loadTasks').and.callFake(() => of(loadedTasks));
		actions = hot('--a--', { a: new LoadTasksAction() });
		const expectedResults = cold('--b--', { b: new LoadTasksFinishedAction(loadedTasks) });
		expect(tasksEffects.loadTasks$).toBeObservable(expectedResults);
	});

	it('onLoadTasksFinished$ should return AddTasksAction', () => {
		let loadedTasks: AlgorithmTask[] = [{ ...taskMock, id: 'loadedTask1' }, {
			...taskMock,
			id: 'loadedTask2'
		}, { ...taskMock, id: 'loadedTask1' }];
		actions = hot('--a--', { a: new LoadTasksFinishedAction(loadedTasks) });
		const expectedResults = cold('--b--', { b: new AddTasksAction(loadedTasks) });
		expect(tasksEffects.onLoadTasksFinished$).toBeObservable(expectedResults);
	});

	it('onAddTask$ should call tasksService.createTask with action.payload(new task), and return AddTaskSuccessAction', () => {
		let newTaskPayload: AlgorithmTask = { ...taskMock, id: 'newTaskId', name: 'newTaskName' };
		spyOn(tasksService, 'createTask').and.callFake(() => of(newTaskPayload));
		actions = hot('--a--', { a: new AddTaskAction(newTaskPayload) });
		const expectedResults = cold('--a--', { a: new SelectTaskAction('newTaskId') });
		expect(tasksEffects.onAddTask$).toBeObservable(expectedResults);

	});

	it('onDeleteTask$ should call removeTask. also return SelectTaskAction', () => {
		spyOn(tasksService, 'removeTask').and.returnValue(of({}));
		let taskToDelete: AlgorithmTask = {
			id: 'newTaskId',
			name: 'newTaskName',
			state: null,
			creationTime: new Date(),
			algorithmName: 'ttt',
			status: AlgorithmTaskStatus.SENT,
			runTime: new Date()
		};
		store.dispatch(new AddTaskAction(taskToDelete));
		actions = hot('--a--', { a: new DeleteTaskAction('newTaskId') });
		const expectedResults = cold('--a--', {
			a: new SelectTaskAction(null)
		});
		expect(tasksEffects.onDeleteTask$).toBeObservable(expectedResults);
	});

});
