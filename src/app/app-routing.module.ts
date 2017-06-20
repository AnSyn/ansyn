import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AnsynComponent } from './ansyn/ansyn.component';

const host = {"[style.display]":"'none'"};
const selector = 'empty';
const template = '';

@Component({selector, host, template})
export class EmptyComponent {}

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
	declarations:[EmptyComponent],
	exports:[RouterModule]
})
export class AppRouter {}
