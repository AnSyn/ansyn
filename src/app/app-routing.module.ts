import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AnsynComponent } from './ansyn/ansyn.component';
import { EmptyComponent } from './empty/empty.component';

export const routes: Routes = [

	{
		path: '',
		component: AnsynComponent,
		children: [
			{
				path: ':case_id',
				component: EmptyComponent
			}
		]
	}
];
@NgModule({
	imports: [
		RouterModule.forRoot(routes)
	],
	exports:[RouterModule]
})
export class AppRouter {}
