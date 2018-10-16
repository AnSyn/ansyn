import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { PlaceholderComponent } from './components/placeholder/placeholder.component';
import { UnAuthGuard } from './login/guards/unauth.guard';
import { AuthGuard } from './login/guards/auth.guard';
import { LoginComponent } from './login/login/login.component';
import { AnsynHostComponent } from './components/ansyn-host/ansyn-host.component';
import { CallbackComponent } from '../@ansyn/ansyn/components/callback/callback.component';

export const routes: Routes = [
	{
		path: '',
		component: AnsynHostComponent,
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
	},
	{
		path: 'login',
		component: LoginComponent
	},
	{
		path: 'access_token',
		component: CallbackComponent
	}
];

@NgModule({
	imports: [RouterModule.forRoot(routes, { useHash: true })],
	exports: [RouterModule]
})
export class AppRoutingModule {
}
