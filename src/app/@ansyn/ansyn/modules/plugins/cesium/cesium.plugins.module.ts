import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageryModule } from '@ansyn/imagery';
import { ImageryDimensionModeComponent } from '../components/imagery-dimension-mode/imagery-dimension-mode.component';
import {
	CesiumBINGSourceProvider,
	CesiumMap,
	CesiumOsmSourceProvider,
	CesiumPlanetSourceProvider
} from '@ansyn/imagery-cesium';
import { MapFacadeModule } from '@ansyn/map-facade';

@NgModule({
	declarations: [ImageryDimensionModeComponent],
	entryComponents: [ImageryDimensionModeComponent],
	exports: [ImageryDimensionModeComponent],
	imports: [
		CommonModule,
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
				container: [ImageryDimensionModeComponent],
				status: []
			}
		})
	]
})
export class CesiumPluginsModule {

}
