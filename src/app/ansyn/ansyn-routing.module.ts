import { NgModule } from '@angular/core';
import { CaseComponent } from './case/case.component';
import { AnsynComponent } from './ansyn/ansyn.component';
import { AuthGuard } from '@ansyn/login/guard/auth.guard';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
	{
		path: '',
		component: AnsynComponent,
		data: {
			name: 'case'
		},
		canActivate: [AuthGuard],
		children: [
			{
				path: 'case/:caseId',
				component: CaseComponent,
				data: {
					name: 'caseChild'
				}
			}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})

export class AnsynRoutingModule { }
