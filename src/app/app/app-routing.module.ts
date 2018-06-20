import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { loginRoutes } from '@ansyn/login/login.routes';
import { ansynRoutes } from '@ansyn/ansyn/ansyn.routes';

export const routes: Routes = [];
ansynRoutes.forEach((route) => routes.push(route));
loginRoutes.forEach((route) => routes.push(route));

@NgModule({
	imports: [RouterModule.forRoot(routes, { useHash: true })],
	exports: [RouterModule]
})
export class AppRoutingModule {
}
