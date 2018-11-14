import { TasksEffects } from './tasks.effects';
import { async, inject, TestBed } from '@angular/core/testing';
import { TasksService } from '../services/tasks.service';
import { Store, StoreModule } from '@ngrx/store';
import { tasksFeatureKey, TasksReducer } from '../reducers/tasks.reducer';
import { Observable, of, throwError } from 'rxjs';
import { CoreConfig, ErrorHandlerService, LoggerService, StorageService } from '@ansyn/core';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { Params } from '@angular/router';
import { provideMockActions } from '@ngrx/effects/testing';
import { cold, hot } from 'jasmine-marbles';
import { DataLayersService, layersConfig } from '../../layers-manager/services/data-layers.service';
import { LayerType } from '../../layers-manager/models/layers.model';
import { AlgorithmTask } from '../models/tasks.model';
import { AddTasksAction, LoadTasksAction } from '../actions/tasks.actions';

describe('TasksEffects', () => {
	let tasksEffects: TasksEffects;
	let tasksService: TasksService;
	let loggerService: LoggerService;
	let dataLayersService: DataLayersService;
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
				TasksService,
				DataLayersService,
				{ provide: layersConfig, useValue: {} },
				{
					provide: ErrorHandlerService,
					useValue: { httpErrorHandle: () => throwError(null) }
				},
				provideMockActions(() => actions),
				{ provide: LoggerService, useValue: {} },
				{ provide: CoreConfig, useValue: { storageService: { baseUrl: 'fake-base-url' } } }
			]
		}).compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<any>) => {
		store = _store;
		let selectLayersState =
			[
				{ type: LayerType.annotation }
			];


		spyOn(store, 'select').and.callFake(() => of(selectLayersState));
	}));

	beforeEach(inject([DataLayersService], (_dataLayersService: DataLayersService) => {
		dataLayersService = _dataLayersService;
	}));

	beforeEach(inject([LoggerService], (_loggerService: LoggerService) => {
		loggerService = _loggerService;
	}));

	beforeEach(inject([TasksEffects, TasksService], (_tasksEffects: TasksEffects, _tasksService: TasksService) => {
		tasksEffects = _tasksEffects;
		tasksService = _tasksService;
	}));

	it('should be defined', () => {
		expect(tasksEffects).toBeDefined();
	});

	it('loadTasks$ should call tasksService.loadTasks with task lastId from state, and return LoadTasksSuccessAction', () => {
		let loadedTasks: AlgorithmTask[] = [{ ...taskMock, id: 'loadedTask1' }, {
			...taskMock,
			id: 'loadedTask2'
		}, { ...taskMock, id: 'loadedTask1' }];
		spyOn(tasksService, 'loadTasks').and.callFake(() => of(loadedTasks));
		actions = hot('--a--', { a: new LoadTasksAction() });
		const expectedResults = cold('--b--', { b: new AddTasksAction(loadedTasks) });
		expect(tasksEffects.loadTasks$).toBeObservable(expectedResults);
	});

	it('onAddTask$ should call tasksService.createTask with action.payload(new task), and return AddTaskSuccessAction', () => {
		let newTaskPayload: AlgorithmTask = { ...taskMock, id: 'newTaskId', name: 'newTaskName' };
		spyOn(tasksService, 'createTask').and.callFake(() => of(newTaskPayload));
		actions = hot('--a--', { a: new AddTaskAction(newTaskPayload) });
		const expectedResults = cold('--a--', { a: new SelectTaskAction(newTaskPayload) });
		expect(tasksEffects.onAddTask$).toBeObservable(expectedResults);

	});

	it('onDeleteTask$ should call DeleteTaskBackendAction. when deleted task equal to selected task LoadDefaultTaskAction should have been called too', () => {

		// let deletedTask: Task = { id: 'newTaskId', name: 'newTaskName' };
		// store.dispatch(new AddTaskAction(deletedTask));
		// store.dispatch(new SelectTaskAction(deletedTask));
		// store.dispatch(new OpenModalAction({ component: '', taskId: deletedTask.id }));
		// actions = hot('--a--', { a: new DeleteTaskAction('') });
		// const expectedResults = cold('--(a)--', {
		// 	a: new LoadDefaultTaskAction()
		// });
		// expect(tasksEffects.onDeleteTask$).toBeObservable(expectedResults);
	});

	it('onUpdateTask$ should call tasksService.updateTask with action.payload("updatedTask"), and return UpdateTaskAction', () => {
		const updatedTask: ITask = { ...taskMock, id: 'updatedTaskId' };
		actions = hot('--a--', { a: new UpdateTaskAction({ updatedTask: updatedTask, forceUpdate: true }) });
		const expectedResults = cold('--b--', { b: new UpdateTaskBackendAction(updatedTask) });
		expect(tasksEffects.onUpdateTask$).toBeObservable(expectedResults);
	});

	it('loadDefaultTask$ should call updateTaskViaQueryParmas and dispatch SelectTaskAction ', () => {
		spyOnProperty(tasksService, 'defaultTask', 'get').and.returnValue({ id: '31b33526-6447-495f-8b52-83be3f6b55bd' } as any);
		spyOn(tasksService.queryParamsHelper, 'updateTaskViaQueryParmas')
			.and
			.returnValue('updateTaskViaQueryParmasResult');
		const queryParmas: Params = { foo: 'bar' };
		actions = hot('--a--', { a: new LoadDefaultTaskAction(queryParmas) });
		const expectedResults = cold('--b--', { b: new SelectTaskAction('updateTaskViaQueryParmasResult' as any) });
		expect(tasksEffects.loadDefaultTask$).toBeObservable(expectedResults);
	});

	it('onSaveTaskAs$ should add a default task', () => {
		const selectedTask = {
			id: 'selectedTaskId',
			selectedContextId: 'selectedContextId',
			state: {
				layers: {
					activeLayersIds: [
						'111',
						'222'
					]
				}
			}
		} as ITask;

		let serverResponse = [
			{
				id: 'taskId',
				name: 'taskId',
				type: 'Static',
				dataLayers: [
					{
						'id': 'layerId_1234',
						'name': 'New York Roads',
						'isChecked': true
					}
				]
			}
		];

		spyOn(dataLayersService, 'addLayer').and.returnValue(of(serverResponse));
		spyOn(tasksService, 'createTask').and.callFake(() => of(selectedTask));
		actions = hot('--a--', { a: new SaveTaskAsAction(selectedTask) });
		const expectedResults = cold('--b--', { b: new SaveTaskAsSuccessAction(selectedTask) });
		expect(tasksEffects.onSaveTaskAs$).toBeObservable(expectedResults);
	});

	describe('loadTask$', () => {
		it('should load the given task', () => {
			const myTaskId = 'myTaskId';
			const taskToLoad: ITask = { ...taskMock, id: myTaskId };
			spyOn(tasksService, 'loadTask').and.returnValue(of(taskToLoad));
			actions = hot('--a--', { a: new LoadTaskAction(myTaskId) });
			const expectedResults = cold('--b--', { b: new SelectDilutedTaskAction(taskToLoad) });
			expect(tasksEffects.loadTask$).toBeObservable(expectedResults);
		});
		it('should load the default task, if the given task fails to load', () => {
			const myTaskId = 'myTaskId';
			spyOn(tasksService, 'loadTask').and.throwError('');
			actions = hot('--a--', { a: new LoadTaskAction(myTaskId) });
			const expectedResults = cold('--(b|)', { b: new LoadDefaultTaskAction() });
			expect(tasksEffects.loadTask$).toBeObservable(expectedResults);
		});
	});

});
