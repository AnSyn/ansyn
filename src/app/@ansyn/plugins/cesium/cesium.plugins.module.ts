import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageryModule } from '@ansyn/imagery';
import { CesiumMap } from '../cesium/maps/cesium-map/cesium-map';
import { CesiumBINGSourceProvider } from './mapSourceProviders/cesium-BING-source-provider';
import { OsmSourceProvider } from './mapSourceProviders/cesium.osm.source-provider';

@NgModule({
	imports: [
		CommonModule,
		ImageryModule.provide({
			plugins: [],
			maps: [
				CesiumMap
			],
			mapSourceProviders: [
				OsmSourceProvider,
				CesiumBINGSourceProvider
			]
		})
	]
})
export class CesiumPluginsModule {

}
