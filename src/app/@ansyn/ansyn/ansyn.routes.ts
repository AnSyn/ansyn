import { AnsynComponent } from './ansyn/ansyn.component';
import { Routes } from '@angular/router';
import { AuthGuard } from '@ansyn/login/guards/auth.guard';
import { UnAuthGuard } from '@ansyn/login/guards/unauth.guard';
import { PlaceholderComponent } from '@ansyn/core/components/placeholder/placeholder.component';


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
