import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlgorithmsComponent } from './components/algorithms/algorithms.component';
import { CoreModule } from '@ansyn/core';
import { TasksTableComponent } from './components/tasks-table/tasks-table.component';
import { TasksTablePageComponent } from './components/tasks-table-page/tasks-table-page.component';
import { TasksTablePageHeaderComponent } from './components/tasks-table-page-header/tasks-table-page-header.component';
import { TasksFormPageComponent } from './components/tasks-form-page/tasks-form-page.component';

@NgModule({
	imports: [CoreModule, CommonModule],
	declarations: [AlgorithmsComponent, TasksTableComponent, TasksTablePageComponent, TasksTablePageHeaderComponent, TasksFormPageComponent],
	entryComponents: [AlgorithmsComponent],
	exports: [AlgorithmsComponent]
})
export class AlgorithmsModule {

}
