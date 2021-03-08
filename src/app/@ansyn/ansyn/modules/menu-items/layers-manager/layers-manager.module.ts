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
import { DownloadLayersComponent } from './components/data-layers-modals/download-layers/download-layers.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LayerMenuComponent } from './components/layer-menu/layer-menu.component';
import { DataLayersModalsComponent } from './components/data-layers-modals/data-layers-modals.component';
import { EditLayerComponent } from './components/data-layers-modals/edit-layer/edit-layer.component';
import { DeleteLayerComponent } from './components/data-layers-modals/delete-layer/delete-layer.component';
import { ImportLayerComponent } from './components/import-layer/import-layer.component';
import { CoreModule } from '../../core/core.module';
import { EntitiesTableModule } from '../../entities-table/entities-table.module';
import { StaticLayersComponent } from './components/static-layers/static-layers.component';
import { BaseLayersComponent } from './components/base-layers/base-layers.component';
import { AnnotationLayersComponent } from './components/annotation-layers/annotation-layers.component';
import { LayersSearchComponent } from './components/layers-search/layers-search.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';

// @dynamic
@NgModule({
	imports: [
		CoreModule,
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		StoreModule.forFeature(layersFeatureKey, LayersReducer),
		EffectsModule.forFeature([LayersEffects]),
		EntitiesTableModule,
		MatInputModule,
		MatAutocompleteModule
	],
	declarations: [LayersManagerComponent, LayerCollectionComponent, DownloadLayersComponent, LayerMenuComponent, DataLayersModalsComponent, EditLayerComponent, DeleteLayerComponent, ImportLayerComponent, StaticLayersComponent, BaseLayersComponent, AnnotationLayersComponent, LayersSearchComponent],
	providers: [DataLayersService]
})

export class LayersManagerModule {
	static forRoot(config: ILayersManagerConfig): ModuleWithProviders<LayersManagerModule> {
		return {
			ngModule: LayersManagerModule,
			providers: [
				DataLayersService,
				{ provide: layersConfig, useValue: config }
			]
		};
	}
}
