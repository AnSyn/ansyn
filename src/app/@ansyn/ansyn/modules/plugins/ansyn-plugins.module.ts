import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OpenlayersPluginsModule } from './openlayers/openlayers.plugins.module';
import { CesiumPluginsModule } from './cesium/cesium.plugins.module';
import { EffectsModule } from '@ngrx/effects';
import { PluginsEffects } from './effects/plugins.effects';

@NgModule({
	imports: [
		CommonModule,
		OpenlayersPluginsModule,
		CesiumPluginsModule,
		EffectsModule.forFeature([PluginsEffects])
	]
})
export class AnsynPluginsModule {

}
