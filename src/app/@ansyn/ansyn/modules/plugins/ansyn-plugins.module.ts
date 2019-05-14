import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OpenlayersPluginsModule } from './openlayers/openlayers.plugins.module';
import { ImageryModule } from '@ansyn/imagery';
import {
	CesiumBINGSourceProvider,
	CesiumMap,
	CesiumOsmSourceProvider,
	CesiumPlanetSourceProvider
} from '@ansyn/imagery-cesium';


@NgModule({
	imports: [
		CommonModule,
		OpenlayersPluginsModule,
		ImageryModule.provide({
			plugins: [],
			maps: [CesiumMap],
			mapSourceProviders: [
				CesiumBINGSourceProvider,
				CesiumOsmSourceProvider,
				CesiumPlanetSourceProvider
			]
		})
	]
})
export class AnsynPluginsModule {

}
