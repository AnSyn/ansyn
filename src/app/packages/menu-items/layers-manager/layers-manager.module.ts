import { ILayersManagerConfig } from './models/layers-manager-config';
import { LayersEffects } from './effects/layers.effects';
import { EffectsModule } from '@ngrx/effects';
import { DataLayersService, layersConfig } from './services/data-layers.service';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeModule } from 'angular-tree-component';
import { LayersManagerComponent } from './components/layers-manager/layers-manager.component';
import { LayerTreeComponent } from './components/layer-tree/layer-tree.component';

@NgModule({
	imports: [
		CommonModule,
		TreeModule,
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
