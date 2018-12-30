import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageryComponent } from './imagery/imagery.component';
import { IImageryConfig, initialImageryConfig } from './model/iimagery-config';
import { createImageryMapsCollection, ImageryMapsProvider } from './providers/imagery-map-collection';
import { MapComponent } from './map/map.component';
import { IBaseImageryMapConstructor } from './model/base-imagery-map';
import { BaseMapSourceProviderProvider, createMapSourceProviders } from './providers/map-source-providers';
import { createConfig } from './providers/config';
import { createPluginsCollection } from './providers/plugins-collection';
import { IBaseImageryPluginConstructor } from './model/base-imagery-plugin';
import { IBaseMapSourceProviderConstructor } from './model/base-map-source-provider';
import { StoreModule } from '@ngrx/store';
import { imageryFeatureKey, ImageryReducer } from './reducers/imagery.reducers';
import { EffectsModule } from '@ngrx/effects';
import { ImageryEffects } from './effects/imagery.effects';

export interface ImageryMetaData {
	maps: IBaseImageryMapConstructor[],
	plugins: IBaseImageryPluginConstructor[],
	mapSourceProviders: IBaseMapSourceProviderConstructor[]
}

// @dynamic
@NgModule({
	imports: [
		CommonModule,
		StoreModule.forFeature(imageryFeatureKey, ImageryReducer),
		EffectsModule.forFeature([ImageryEffects])
	],
	declarations: [ImageryComponent, MapComponent],
	entryComponents: [MapComponent],
	providers: [
		createConfig(initialImageryConfig),
		createPluginsCollection([]),
		createImageryMapsCollection([]),
		createMapSourceProviders([]),
		BaseMapSourceProviderProvider,
		ImageryMapsProvider
	],
	exports: [ImageryComponent]
})
export class ImageryModule {

	static provide(metadata: ImageryMetaData): ModuleWithProviders {
		return {
			ngModule: ImageryModule,
			providers: [
				createImageryMapsCollection(metadata.maps),
				createPluginsCollection(metadata.plugins),
				createMapSourceProviders(metadata.mapSourceProviders)
			]
		};
	}

	static provideConfig(config: IImageryConfig): ModuleWithProviders {
		return {
			ngModule: ImageryModule,
			providers: [createConfig(config)]
		};
	}

}
