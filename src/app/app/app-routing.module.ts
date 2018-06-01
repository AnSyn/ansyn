import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { loginRoutes } from '@ansyn/login/login.routes';
import { ansynRoutes } from '@ansyn/ansyn/ansyn.routes';

export const routes: Routes = [
	...ansynRoutes,
	...loginRoutes
];

@NgModule({
	imports: [RouterModule.forRoot(routes, { useHash: true })],
	exports: [RouterModule]
})
export class AppRoutingModule {
}
