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
	CesiumDrawAnnotationsVisualizer,
	CesiumSentinelSourceProvider
} from '@ansyn/imagery-cesium';
import { MapFacadeModule } from '@ansyn/map-facade';
import { NorthCalculationsPlugin } from './plugins/north-calculations/north-calculations.plugin';
import { MouseMarkerPlugin } from './plugins/mouse-marker/mouse-marker.plugin';
import { AnnotationsVisualizer } from './plugins/annotations.visualizer';

@NgModule({
	declarations: [],
	entryComponents: [],
	exports: [],
	imports: [
		CommonModule,
		ImageryModule.provide({
			plugins: [
				NorthCalculationsPlugin,
				MouseMarkerPlugin,
				CesiumDrawAnnotationsVisualizer,
				AnnotationsVisualizer
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
