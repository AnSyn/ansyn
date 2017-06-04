import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AnsynComponent } from './ansyn/ansyn.component';

const routes: Routes = [
	{
		path: '',
		component: AnsynComponent,
	},
	{
		path: ':case_id',
		component: AnsynComponent
	}
];

@NgModule({
	imports: [
		RouterModule.forRoot(routes)
	],
	exports:[RouterModule]
})
export class AppRouter {}
