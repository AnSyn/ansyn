import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlgorithmsComponent } from './components/algorithms/algorithms.component';
import { CoreModule } from '@ansyn/core';
import { TasksTableComponent } from './components/tasks-table/tasks-table.component';
import { TasksTablePageComponent } from './components/tasks-table-page/tasks-table-page.component';
import { TasksTablePageHeaderComponent } from './components/tasks-table-page-header/tasks-table-page-header.component';
import { TasksFormPageComponent } from './components/tasks-form-page/tasks-form-page.component';
import { TasksFormPageHeaderComponent } from './components/tasks-form-page-header/tasks-form-page-header.component';
import { TasksFormComponent } from './components/tasks-form/tasks-form.component';
import { FormsModule } from '@angular/forms';
import { AlgorithmsConfigService } from './services/algorithms-config.service';
import { StoreModule } from '@ngrx/store';
import { algorithmsFeatureKey, AlgorithmsReducer } from './reducers/algorithms.reducer';

@NgModule({
	imports: [
		CoreModule,
		CommonModule,
		FormsModule,
		StoreModule.forFeature(algorithmsFeatureKey, AlgorithmsReducer)
	],
	declarations: [AlgorithmsComponent, TasksTableComponent, TasksTablePageComponent, TasksTablePageHeaderComponent, TasksFormPageComponent, TasksFormPageHeaderComponent, TasksFormComponent],
	entryComponents: [AlgorithmsComponent],
	exports: [AlgorithmsComponent],
	providers: [AlgorithmsConfigService]
})
export class AlgorithmsModule {

}
