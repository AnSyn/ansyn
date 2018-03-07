import { PlaceholderComponent } from '@ansyn/core/';
import { AnsynComponent } from './ansyn/ansyn.component';
import { AuthGuard, UnAuthGuard } from '@ansyn/login/guards';
import { Routes } from '@angular/router';


export const ansynRoutes: Routes = [
	{
		path: '',
		component: AnsynComponent,
		data: {
			name: 'case'
		},
		canActivate: [AuthGuard],
		canDeactivate: [UnAuthGuard],
		children: [
			{
				path: 'case/:caseId',
				component: PlaceholderComponent,
				data: {
					name: 'caseChild'
				}
			}
		]
	}
];
