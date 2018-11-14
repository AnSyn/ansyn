import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TasksModalContainerComponent } from './tasks-modal-container.component';
import { DeleteTaskComponent } from '../delete-task/delete-task.component';
import { TasksModule } from '../../tasks.module';
import { OpenModalAction } from '../../actions/tasks.actions';
import { StoreModule } from '@ngrx/store';
import { tasksFeatureKey, TasksReducer } from '../../reducers/tasks.reducer';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { EffectsModule } from '@ngrx/effects';
import { CoreConfig, LoggerConfig } from '@ansyn/core';
import { DataLayersService, layersConfig } from '../../../layers-manager/services/data-layers.service';

describe('ModalContainerComponent', () => {
	let component: TasksModalContainerComponent;
	let fixture: ComponentFixture<TasksModalContainerComponent>;

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
				{ provide: tasksConfig, useValue: { schema: null } },
				{ provide: LoggerConfig, useValue: {} },
				{ provide: CoreConfig, useValue: {} },
				{ provide: layersConfig, useValue: {} }
			]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(TasksModalContainerComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('buildTemplate should get OpenModalAction and create modal component ', () => {
		let action = new OpenModalAction({ component: DeleteTaskComponent });
		component.buildTemplate(action);
		expect(fixture.nativeElement.querySelector('ansyn-delete-task')).toBeDefined();
		expect(component.selectedComponentRef.instance instanceof DeleteTaskComponent).toBeTruthy();
	});

	it('destroyTemplate should destory modal component', () => {
		component.selectedComponentRef = { destroy: () => null };
		spyOn(component.selectedComponentRef, 'destroy');
		component.destroyTemplate();
		expect(component.selectedComponentRef.destroy).toHaveBeenCalled();
	});


});
