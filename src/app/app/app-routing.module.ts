import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { PlaceholderComponent } from '@ansyn/core';
import { UnAuthGuard } from './login/guards/unauth.guard';
import { AnsynComponent } from '@ansyn/ansyn';
import { AuthGuard } from './login/guards/auth.guard';
import { LoginComponent } from './login/login/login.component';

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
	}
];

@NgModule({
	imports: [RouterModule.forRoot(routes, { useHash: true })],
	exports: [RouterModule]
})
export class AppRoutingModule {
}
