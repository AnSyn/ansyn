import { NgModule } from '@angular/core';
import { CaseComponent } from './case/case.component';
import { AnsynComponent } from './ansyn/ansyn.component';
import { AuthGuard } from '@ansyn/login/guard/auth.guard';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
	{
		path: '',
		component: AnsynComponent,
		canActivate: [AuthGuard],
		children: [
			{
				path: 'case/:case_id',
				component: CaseComponent
			}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})

export class AnsynRoutingModule { }
