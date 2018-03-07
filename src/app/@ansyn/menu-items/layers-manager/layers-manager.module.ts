import { ILayersManagerConfig } from './models/layers-manager-config';
import { LayersEffects } from './effects/layers.effects';
import { EffectsModule } from '@ngrx/effects';
import { DataLayersService, layersConfig } from './services/data-layers.service';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeModule } from 'angular-tree-component';
import { LayersManagerComponent } from './components/layers-manager/layers-manager.component';
import { LayerTreeComponent } from './components/layer-tree/layer-tree.component';
import { StoreModule } from '@ngrx/store';
import { layersFeatureKey, LayersReducer } from './reducers/layers.reducer';
import { CoreModule } from '@ansyn/core/index';

@NgModule({
	imports: [
		CoreModule,
		CommonModule,
		TreeModule,
		StoreModule.forFeature(layersFeatureKey, LayersReducer),
		EffectsModule.forFeature([LayersEffects])
	],
	declarations: [LayersManagerComponent, LayerTreeComponent],
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
