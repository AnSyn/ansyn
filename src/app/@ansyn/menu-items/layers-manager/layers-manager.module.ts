import { ILayersManagerConfig } from './models/layers-manager-config';
import { LayersEffects } from './effects/layers.effects';
import { EffectsModule } from '@ngrx/effects';
import { DataLayersService, layersConfig } from './services/data-layers.service';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayersManagerComponent } from './components/layers-manager/layers-manager.component';
import { StoreModule } from '@ngrx/store';
import { layersFeatureKey, LayersReducer } from './reducers/layers.reducer';
import { LayerCollectionComponent } from './components/layers-collection/layer-collection.component';
import { CoreModule } from '@ansyn/core/core.module';
import { DownloadLayersComponent } from './components/data-layers-modals/download-layers/download-layers.component';
import { LayerComponent } from './components/layer/layer.component';
import { FormsModule } from '@angular/forms';
import { LayerMenuComponent } from './components/layer-menu/layer-menu.component';
import { DataLayersModalsComponent } from './components/data-layers-modals/data-layers-modals.component';
import { EditLayerComponent } from './components/data-layers-modals/edit-layer/edit-layer.component';
import { DeleteLayerComponent } from './components/data-layers-modals/delete-layer/delete-layer.component';
import { ImportLayerComponent } from './components/import-layer/import-layer.component';
import { Observable } from 'rxjs';

class BuilderDataLayersService extends DataLayersService {
	getAllLayersInATree() {
		return Observable.of([]);
	}
}

@NgModule({
	imports: [
		CoreModule,
		CommonModule,
		FormsModule,
		StoreModule.forFeature(layersFeatureKey, LayersReducer),
		EffectsModule.forFeature([LayersEffects])
	],
	declarations: [LayersManagerComponent, LayerCollectionComponent, DownloadLayersComponent, LayerComponent, LayerMenuComponent, DataLayersModalsComponent, EditLayerComponent, DeleteLayerComponent, ImportLayerComponent],
	entryComponents: [LayersManagerComponent],
	providers: [{ provide: DataLayersService, useClass: BuilderDataLayersService }]
})

export class LayersManagerModule {
	static forRoot(config: ILayersManagerConfig): ModuleWithProviders {


		return {
			ngModule: LayersManagerModule,
			providers: [
				{ provide: DataLayersService, useClass: BuilderDataLayersService },
				{ provide: layersConfig, useValue: config }
			]
		};
	}
}
