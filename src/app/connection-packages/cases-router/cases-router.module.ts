import { NgModule } from '@angular/core';
import { CasesRouterEffects } from './effects/cases-router.effects';
import { EffectsModule } from '@ngrx/effects';

@NgModule({
	imports: [EffectsModule.forFeature([CasesRouterEffects])]
})
export class CasesRouterModule {
}
