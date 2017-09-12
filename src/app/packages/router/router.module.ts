import { APP_INITIALIZER, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EffectsModule } from '@ngrx/effects';
import { RouterEffects } from './effects/router.effects';
import { AnsynRouterService } from './services/router.service';
import { RouterModule } from '@angular/router';

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
			useFactory: useFactoryInitializer,
			deps: [AnsynRouterService],
			multi: true
		},
	]
})

export class AnsynRouterModule {

}

export function useFactoryInitializer(ansynRouterService: AnsynRouterService) {
	return function () {
		ansynRouterService.onNavigationEnd().subscribe();
	};
}
