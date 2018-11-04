import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TasksFormComponent } from './tasks-form.component';
import { FormsModule } from '@angular/forms';
import { CoreModule } from '../../../../core/core.module';
import { StoreModule } from '@ngrx/store';
import { coreFeatureKey, CoreReducer } from '../../../../core/reducers/core.reducer';
import { EffectsModule } from '@ngrx/effects';

describe('TasksFormComponent', () => {
	let component: TasksFormComponent;
	let fixture: ComponentFixture<TasksFormComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [TasksFormComponent],
			imports: [
				FormsModule,

				CoreModule,
				StoreModule.forRoot({ [coreFeatureKey]: CoreReducer }),
				EffectsModule.forRoot([])
			]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(TasksFormComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
