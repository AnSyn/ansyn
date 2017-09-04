import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { ansynRoutes } from './ansyn/ansyn.routes';
import { loginRoutes } from '@ansyn/login';

export const routes: Routes = [
	...ansynRoutes,
	...loginRoutes
];

@NgModule({
	imports: [RouterModule.forRoot(routes, {useHash: true})],
	exports: [RouterModule]
})
export class AppRoutingModule {}
