import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageryModule } from '@ansyn/imagery';
import {
	CesiumBINGSourceProvider,
	CesiumGeoServerSourceProvider,
	CesiumMap,
	CesiumOpenAerialSourceProvider,
	CesiumOsmSourceProvider,
	CesiumPlanetSourceProvider,
	CesiumSentinelSourceProvider
} from '@ansyn/imagery-cesium';
import { MapFacadeModule } from '@ansyn/map-facade';
import { NorthCalculationsPlugin } from './plugins/north-calculations/north-calculations.plugin';
import { MouseMarkerPlugin } from './plugins/mouse-marker/mouse-marker.plugin';

@NgModule({
	declarations: [],
	entryComponents: [],
	exports: [],
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
				CesiumGeoServerSourceProvider,
				CesiumSentinelSourceProvider
			]
		}),
		MapFacadeModule.provide({
			entryComponents: {
				container: [],
				status: [],
				floating_menu: []
			}
		})
	]
})
export class CesiumPluginsModule {

}
