import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { DeleteTaskComponent } from './delete-task.component';
import { Store, StoreModule } from '@ngrx/store';
import { algorithmsFeatureKey, AlgorithmsReducer, IAlgorithmState } from '../../reducers/algorithms.reducer';
import { AlgorithmsModule } from '../../algorithms.module';
import { CloseModalAction, DeleteAlgorithmTaskAction } from '../../actions/algorithms.actions';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { EffectsModule } from '@ngrx/effects';
import { CoreConfig, LoggerConfig } from '@ansyn/core';
import { AlgorithmsService } from '../../services/algorithms.service';
import { DataLayersService, layersConfig } from '../../../layers-manager/services/data-layers.service';

describe('DeleteTaskComponent', () => {
	let component: DeleteTaskComponent;
	let fixture: ComponentFixture<DeleteTaskComponent>;
	let tasksService: AlgorithmsService;

	const fakeIAlgorithmState: IAlgorithmState = {
		entities: {
			'fakeId1': { id: 'fakeId1', name: 'fakeName1' },
			'fakeId2': { id: 'fakeId2', name: 'fakeName2' }
		},
		ids: ['fakeId1', 'fakeId2'],
		modalTaskId: 'fakeId1',
		modal: {
			id: 'fakeId1',
			show: true
		}
	} as any;

	let store: Store<IAlgorithmState>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				HttpClientModule,
				AlgorithmsModule,
				EffectsModule.forRoot([]),
				StoreModule.forRoot({ [algorithmsFeatureKey]: AlgorithmsReducer }),
				RouterTestingModule
			],
			providers: [
				DataLayersService,
				{ provide: LoggerConfig, useValue: {} },
				{ provide: CoreConfig, useValue: {} },
				{ provide: layersConfig, useValue: {} }
			]
		}).compileComponents();
	}));

	beforeEach(inject([Store, AlgorithmsService], (_store: Store<IAlgorithmState>, _tasksService: AlgorithmsService) => {
		spyOn(_store, 'dispatch');
		spyOn(_store, 'select').and.callFake(() => of(fakeIAlgorithmState));

		fixture = TestBed.createComponent(DeleteTaskComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		store = _store;
		tasksService = _tasksService;
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('close should call store.dispatch with CloseModalAction', () => {
		component.close();
		expect(store.dispatch).toHaveBeenCalledWith(new CloseModalAction());
	});

	it('onSubmitRemove should call store.dispatch with CloseModalAction', () => {
		spyOn(tasksService, 'removeTask').and.returnValue(of(component.activeTask));
		spyOn(component, 'close');
		component.onSubmitRemove();
		expect(store.dispatch).toHaveBeenCalledWith(new DeleteAlgorithmTaskAction(component.activeTask.id));
		expect(component.close).toHaveBeenCalled();

	});

});
