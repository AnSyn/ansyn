import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { ToolsMapEffects } from './effects/tools-map.effects';

@NgModule({
	imports: [EffectsModule.run(ToolsMapEffects)]
})
export class ToolsMapsModule {
}
