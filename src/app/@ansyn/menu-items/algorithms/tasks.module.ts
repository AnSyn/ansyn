import { NgModule } from '@angular/core';
import { MenuModule } from '@ansyn/menu';
import { MapFacadeModule } from '@ansyn/map-facade';
import { CommonModule } from '@angular/common';
import { TasksComponent } from './components/tasks/tasks.component';
import { CoreModule } from '@ansyn/core';
import { TasksTableComponent } from './components/tasks-table/tasks-table.component';
import { TasksTablePageComponent } from './components/tasks-table-page/tasks-table-page.component';
import { TasksTablePageHeaderComponent } from './components/tasks-table-page-header/tasks-table-page-header.component';
import { TasksFormPageComponent } from './components/tasks-form-page/tasks-form-page.component';
import { TasksFormPageHeaderComponent } from './components/tasks-form-page-header/tasks-form-page-header.component';
import { TasksFormComponent } from './components/tasks-form/tasks-form.component';
import { FormsModule } from '@angular/forms';
import { TasksService } from './services/tasks.service';
import { StoreModule } from '@ngrx/store';
import { tasksFeatureKey, TasksReducer } from './reducers/tasks.reducer';
import { EffectsModule } from '@ngrx/effects';
import { TasksEffects } from './effects/tasks.effects';
import { RemoveTaskModalComponent } from './components/remove-task-modal/remove-task-modal.component';

@NgModule({
	imports: [
		CoreModule,
		MapFacadeModule,
		MenuModule,
		CommonModule,
		FormsModule,
		StoreModule.forFeature(tasksFeatureKey, TasksReducer),
		EffectsModule.forFeature([TasksEffects]),
	],
	declarations: [TasksComponent, TasksTableComponent, TasksTablePageComponent, TasksTablePageHeaderComponent,
		TasksFormPageComponent, TasksFormPageHeaderComponent, TasksFormComponent, RemoveTaskModalComponent],
	entryComponents: [TasksComponent],
	exports: [TasksComponent],
	providers: [TasksService]
})
export class TasksModule {

}
