import { Component, HostBinding, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AnsynComponent } from './ansyn/ansyn.component';
import { configuration } from '../configuration/configuration';

const selector = 'empty';
const template = '<div></div>';

@Component({selector, template})
export class EmptyComponent {
	@HostBinding('style.display') display= "none";
}

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
		RouterModule.forRoot(routes, {useHash: configuration.CasesConfig.useHash})
	],
	declarations:[EmptyComponent],
	exports:[RouterModule]
})
export class AppRouter {}
