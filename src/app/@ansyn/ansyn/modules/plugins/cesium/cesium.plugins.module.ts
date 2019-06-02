import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageryModule } from '@ansyn/imagery';
import { ImageryDimensionModeComponent } from '../components/imagery-dimension-mode/imagery-dimension-mode.component';
import {
	CesiumBINGSourceProvider,
	CesiumOpenAerialSourceProvider,
	CesiumMap,
	CesiumOsmSourceProvider,
	CesiumPlanetSourceProvider,
	CesiumGeoServerSourceProvider
} from '@ansyn/imagery-cesium';
import { MapFacadeModule } from '@ansyn/map-facade';
import { NorthCalculationsPlugin } from './plugins/north-calculations/north-calculations.plugin';
import { MouseMarkerPlugin } from './plugins/mouse-marker/mouse-marker.plugin';

@NgModule({
	declarations: [ImageryDimensionModeComponent],
	entryComponents: [ImageryDimensionModeComponent],
	exports: [ImageryDimensionModeComponent],
	imports: [
		CommonModule,
		ImageryModule.provide({
			plugins: [
				NorthCalculationsPlugin,
				MouseMarkerPlugin
			],
			maps: [CesiumMap],
			mapSourceProviders: [
				CesiumBINGSourceProvider,
				CesiumOsmSourceProvider,
				CesiumPlanetSourceProvider,
				CesiumOpenAerialSourceProvider,
				CesiumGeoServerSourceProvider
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
