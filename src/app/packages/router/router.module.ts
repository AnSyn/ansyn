import { APP_INITIALIZER, Injectable, Injector, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EffectsModule } from '@ngrx/effects';
import { RouterEffects } from './effects/router.effects';
import { AnsynRouterService } from './services/router.service';
import { Router, RouterModule } from '@angular/router';

@NgModule({
	imports: [
		CommonModule,
		RouterModule,
		EffectsModule.run(RouterEffects)
	],
	declarations: [],
	providers: [
		AnsynRouterService,
		{
			provide: APP_INITIALIZER,
			useFactory(ansynRouterService: AnsynRouterService) {
				return () => ansynRouterService.onNavigationEnd();
			},
			deps: [AnsynRouterService],
			multi: true
		},
	]
})

export class AnsynRouterModule {

}
