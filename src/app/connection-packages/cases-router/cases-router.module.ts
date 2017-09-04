import { NgModule } from '@angular/core';
import { CasesRouterEffects } from './effects/cases-router.effects';
import { EffectsModule } from '@ngrx/effects';

@NgModule({
	imports: [EffectsModule.run(CasesRouterEffects)]
})
export class CasesRouterModule { }
