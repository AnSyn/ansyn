import { async, ComponentFixture, fakeAsync, inject, TestBed, tick } from '@angular/core/testing';

import { TasksFormComponent } from './tasks-form.component';
import { FormsModule } from '@angular/forms';
import { Store, StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { TasksService } from '../../services/tasks.service';
import { EffectsModule } from '@ngrx/effects';
import { TasksRemoteService } from '../../services/tasks-remote.service';
import { ITasksState, tasksFeatureKey, TasksReducer } from '../../reducers/tasks.reducer';
import { AlgorithmTask, AlgorithmTaskStatus } from '../../models/tasks.model';
import { SetCurrentTask, SetCurrentTaskAlgorithmName, SetCurrentTaskMasterOverlay } from '../../actions/tasks.actions';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { mapFeatureKey, MapReducer, SetFavoriteOverlaysAction } from '@ansyn/map-facade';
import { Overlay } from '@ansyn/imagery';
import { AnsynFormsModule } from '../../../../core/forms/ansyn-forms.module';
import { MockComponent } from '../../../../core/test/mock-component';
import {
	imageryStatusFeatureKey,
	ImageryStatusReducer
} from '@ansyn/map-facade';

describe('TasksFormComponent', () => {
	let component: TasksFormComponent;
	let fixture: ComponentFixture<TasksFormComponent>;
	let store: Store<ITasksState>;

	const mockLoader = MockComponent({ selector: 'ansyn-loader', inputs: ['show'] });

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [
				TasksFormComponent,
				mockLoader
			],
			imports: [
				FormsModule,
				AnsynFormsModule,
				BrowserAnimationsModule,
				TranslateModule.forRoot(),
				StoreModule.forRoot({
					[tasksFeatureKey]: TasksReducer,
					[mapFeatureKey]: MapReducer,
					[imageryStatusFeatureKey]: ImageryStatusReducer
				}),
				EffectsModule.forRoot([])
			],
			providers: [
				{
					provide: TasksService,
					useValue: {
						config: {
							algorithms: {}
						}
					}
				},
				{
					provide: TasksRemoteService,
					useValue: {}
				}
			]
		})
			.compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<ITasksState>) => {
		fixture = TestBed.createComponent(TasksFormComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		store = _store;
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('checkForErrors()', () => {
		let overlays: Overlay[];
		let task: AlgorithmTask;
		beforeEach(fakeAsync(() => {
			overlays = ['a', 'b'].map((id) => new Overlay({ id: id, sensorName: 'sensor_12' }));
			component.MIN_NUM_OF_OVERLAYS = 2;
			component.tasksService.config = {
				baseUrl: '',
				urlSuffix: '',
				schema: '',
				paginationLimit: 1,
				algorithms: {
					alg_1: {
						maxOverlays: 2,
						timeEstimationPerOverlayInMinutes: 10,
						regionLengthInMeters: 100,
						sensorNames: ['sensor_12']
					}
				}
			};
			task = {
				id: '21',
				creationTime: null,
				runTime: null,
				name: '21',
				algorithmName: 'alg_1',
				status: AlgorithmTaskStatus.NEW,
				state: {
					overlays: [],
					masterOverlay: overlays[0],
					region: {
						type: 'Point'
					}
				}
			};
			store.dispatch(new SetCurrentTask(task));
			store.dispatch(new SetCurrentTaskAlgorithmName('alg_1'));
			store.dispatch(new SetFavoriteOverlaysAction(overlays));
			tick();
		}));
		it('should set empty message by default', () => {
			expect(component.errorMsg).toEqual('');
		});
		it('should check minimum no. of overlays', fakeAsync(() => {
			overlays = [...overlays];
			overlays.pop();
			store.dispatch(new SetFavoriteOverlaysAction(overlays));
			tick();
			expect(component.errorMsg).toEqual(`The number of selected overlays 1 should be at least 2`);
		}));
		it('should check maximum no. of overlays', fakeAsync(() => {
			overlays = [...overlays];
			overlays.push(new Overlay({ id: 'c', sensorName: 'sensor_12' }));
			store.dispatch(new SetFavoriteOverlaysAction(overlays));
			tick();
			expect(component.errorMsg).toEqual(`The number of selected overlays 3 should be at most 2`);
		}));
		it('should check existence of master overlay', fakeAsync(() => {
			store.dispatch(new SetCurrentTaskMasterOverlay(null));
			tick();
			expect(component.errorMsg).toEqual('No master overlay selected');
		}));
	});
});
