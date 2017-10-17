import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { CasesMapEffects } from './effects/cases-map.effects';

@NgModule({
	imports: [EffectsModule.forFeature([CasesMapEffects])]
})
export class CasesMapModule {
}
