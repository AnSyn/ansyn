import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { MapEffects } from './effects/map.effects';
import { MapFacadeService } from './services/map-facade.service';
import { ImageriesManagerComponent } from './components/imageries-manager/imageries-manager.component';
import { ImageryModule } from '../imagery/imagery.module';
import { CommonModule } from '@angular/common';
import { ImageryContainerComponent } from './components/imagery-container/imagery-container.component';
import { CoreModule } from '@ansyn/core';
import { ContextMenuComponent } from './components/context-menu/context-menu.component';
import { FormsModule } from '@angular/forms';
import { mapFeatureKey, MapReducer } from './reducers/map.reducer';
import { StoreModule } from '@ngrx/store';

@NgModule({
	imports: [
		StoreModule.forFeature(mapFeatureKey, MapReducer),
		EffectsModule.forFeature([MapEffects]),
		ImageryModule,
		CommonModule,
		CoreModule,
		FormsModule
	],
	providers: [MapFacadeService],
	declarations: [ImageriesManagerComponent, ImageryContainerComponent, ContextMenuComponent],
	exports: [ImageriesManagerComponent]
})

export class MapFacadeModule {
	constructor() {
	}
}
