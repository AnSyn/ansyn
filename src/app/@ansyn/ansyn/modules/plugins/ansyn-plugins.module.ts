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
import { MapFacadeModule } from '@ansyn/map-facade';
import { ImageryDimensionModeComponent } from './components/imagery-dimension-mode/imagery-dimension-mode.component';

@NgModule({
	declarations: [ ImageryDimensionModeComponent ],
	entryComponents: [ ImageryDimensionModeComponent ],
	exports: [ ImageryDimensionModeComponent ],
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
		}),
		MapFacadeModule.provide({
			entryComponents: {
				container: [ ImageryDimensionModeComponent ],
				status: []
			}
		})
	]
})
export class AnsynPluginsModule {

}
