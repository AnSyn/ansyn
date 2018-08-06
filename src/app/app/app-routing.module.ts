import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { PlaceholderComponent } from '@ansyn/core/components/placeholder/placeholder.component';
import { UnAuthGuard } from '@ansyn/login/guards/unauth.guard';
import { AnsynComponent } from '@ansyn/ansyn/ansyn/ansyn.component';
import { AuthGuard } from '@ansyn/login/guards/auth.guard';
import { LoginComponent } from '@ansyn/login/login/login.component';
import { CallbackComponent } from '@ansyn/ansyn/app-providers/imisight/components/callback/callback.component';
import { Auth0Service } from '@ansyn/ansyn/app-providers/imisight/services/auth0.service';

export const routes: Routes = [
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
	},
	{
		path: 'login',
		component: LoginComponent
	},
	{ path: 'access_token', component: CallbackComponent }
];

@NgModule({
	imports: [RouterModule.forRoot(routes, { useHash: true })],
	exports: [RouterModule]
})
export class AppRoutingModule {
}
