import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageryModule } from '@ansyn/imagery';
import { CesiumMap } from '../cesium/maps/cesium-map/cesium-map';
import { CesiumBINGSourceProvider } from './mapSourceProviders/cesium-BING-source-provider';
import { CesiumOsmSourceProvider } from './mapSourceProviders/cesium-OSM-source-provider';
import { CesiumPlanetSourceProvider } from './mapSourceProviders/cesium-PLANET-source-provider';

@NgModule({
	imports: [
		CommonModule,
		ImageryModule.provide({
			plugins: [],
			maps: [
				CesiumMap
			],
			mapSourceProviders: [
				CesiumOsmSourceProvider,
				CesiumBINGSourceProvider,
				CesiumPlanetSourceProvider
			]
		})
	]
})
export class CesiumPluginsModule {

}
