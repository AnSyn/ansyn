import { ILayersManagerConfig } from './models/layers-manager-config';
import { LayersEffects } from './effects/layers.effects';
import { EffectsModule } from '@ngrx/effects';
import { DataLayersService, layersConfig } from './services/data-layers.service';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayersManagerComponent } from './components/layers-manager/layers-manager.component';
import { StoreModule } from '@ngrx/store';
import { layersFeatureKey, LayersReducer } from './reducers/layers.reducer';
import { LayerCollectionComponent } from '@ansyn/menu-items/layers-manager/components/layers-collection/layer-collection.component';
import { CoreModule } from '@ansyn/core/core.module';
import { DownloadLayersComponent } from './components/download-layers/download-layers.component';
import { AnnotationsCollectionComponent } from './components/annotations-collection/annotations-collection.component';
import { LayerComponent } from './components/layer/layer.component';

@NgModule({
	imports: [
		CoreModule,
		CommonModule,
		StoreModule.forFeature(layersFeatureKey, LayersReducer),
		EffectsModule.forFeature([LayersEffects])
	],
	declarations: [LayersManagerComponent, LayerCollectionComponent, DownloadLayersComponent, AnnotationsCollectionComponent, LayerComponent],
	entryComponents: [LayersManagerComponent],
	providers: [DataLayersService]
})

export class LayersManagerModule {
	static forRoot(config: ILayersManagerConfig): ModuleWithProviders {
		return {
			ngModule: LayersManagerModule,
			providers: [
				DataLayersService,
				{ provide: layersConfig, useValue: config }
			]
		};
	}
}
