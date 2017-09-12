import { ILayersManagerConfig } from './models/layers-manager-config';
import { LayersEffects } from './effects/layers.effects';
import { EffectsModule } from '@ngrx/effects';
import { DataLayersService, layersConfig } from './services/data-layers.service';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeModule } from 'angular-tree-component';
import { LayersManagerComponent } from './components/layers-manager/layers-manager.component';
import { MenuItem, AddMenuItemAction } from '@ansyn/core';
import { LayerTreeComponent } from './components/layer-tree/layer-tree.component';
import { Store } from '@ngrx/store';

@NgModule({
	imports: [
		CommonModule,
		TreeModule,
		EffectsModule.run(LayersEffects)
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

	constructor(store: Store<any>) {
		let menu_item: MenuItem = {
			name: 'Layers Manager',
			component: LayersManagerComponent,
			icon_url: '/assets/icons/data-layers.svg'
		};
		store.dispatch(new AddMenuItemAction(menu_item));
	}
}
