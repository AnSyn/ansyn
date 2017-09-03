import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EffectsModule } from '@ngrx/effects';
import { RouterEffects } from './effects/router.effects';
import { AnsynRouterService } from './services/router.service';

@NgModule({
	imports: [
		CommonModule,
		EffectsModule.run(RouterEffects)
	],
	declarations: [],
	providers: [AnsynRouterService]
})

export class AnsynRouterModule {

}
