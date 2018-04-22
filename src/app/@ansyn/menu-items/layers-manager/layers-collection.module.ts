import { ILayersManagerConfig } from './models/layers-manager-config';
import { LayersEffects } from './effects/layers.effects';
import { EffectsModule } from '@ngrx/effects';
import { LayersService, layersConfig } from './services/layers.service';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayersCollectionComponent } from "@ansyn/menu-items/layers-manager/components/leyrs-collection/layers-collection.component";
import { LayerContainerComponent } from "@ansyn/menu-items/layers-manager/components/layer-container/layer-container.component";
import { EnumLayerContainerComponent } from "@ansyn/menu-items/layers-manager/components/enum-layer-container/enum-layer-container.component";
import { StoreModule } from '@ngrx/store';
import { SortPipe } from './pipes/sort.pipe';
import { layersFeatureKey, LayersReducer } from './reducers/layers.reducer';
import { CoreModule } from '@ansyn/core/index';
import { MapIteratorPipe } from '@ansyn/menu-items/layers-manager/pipes/map-iterator.pipe';

@NgModule({
	imports: [
		CoreModule,
		CommonModule,
		StoreModule.forFeature(layersFeatureKey, LayersReducer),
		EffectsModule.forFeature([LayersEffects])
	],
	declarations: [
		LayersCollectionComponent,
		LayerContainerComponent,
		EnumLayerContainerComponent,
		MapIteratorPipe,
		SortPipe
	],
	entryComponents: [LayersCollectionComponent],
	providers: [LayersService]
})

export class LayersCollectionModule {
	static forRoot(config: ILayersManagerConfig): ModuleWithProviders {
		return {
			ngModule: LayersCollectionModule,
			providers: [
				LayersService,
				{ provide: layersConfig, useValue: config }
			]
		};
	}

}
