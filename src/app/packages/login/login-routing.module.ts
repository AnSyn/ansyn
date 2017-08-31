import { NgModule } from '@angular/core';
import { LoginComponent } from './login/login.component';
import { RouterModule, Routes } from '@angular/router';
import { LoginGuard } from './guard/login.guard';

const routes: Routes = [
	{
		path: 'login',
		component: LoginComponent,
		canActivate: [LoginGuard]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
	providers: [LoginGuard]
})

export class LoginRoutingModule { }
