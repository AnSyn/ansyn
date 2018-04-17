import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { MapEffects } from './effects/map.effects';
import { MapFacadeService } from './services/map-facade.service';
import { ImageriesManagerComponent } from './components/imageries-manager/imageries-manager.component';
import { ImageryModule } from '@ansyn/imagery/imagery.module';
import { CommonModule } from '@angular/common';
import { ImageryContainerComponent } from './components/imagery-container/imagery-container.component';
import { CoreModule } from '@ansyn/core';
import { ContextMenuComponent } from './components/context-menu/context-menu.component';
import { FormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { AnnotationContextMenuComponent } from './components/annotation-context-menu/annotation-context-menu.component';
import { ImageryRotationComponent } from './components/imagery-rotation/imagery-rotation.component';
import { ImageryLoaderComponent } from './components/imagery-loader/imagery-loader.component';
import { ImageryTileProgressComponent } from '@ansyn/map-facade/components/imagery-tile-progress/imagery-tile-progress.component';
import { OverlaySourceTypeNoticeComponent } from '@ansyn/map-facade/components/overlay-source-type-notice/overlay-source-type-notice.component';
import { MapReducer } from '@ansyn/map-facade/reducers';
import { mapFeatureKey } from '@ansyn/map-facade/reducers/interfaces';

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
	declarations: [
		ImageriesManagerComponent,
		ImageryRotationComponent,
		ImageryContainerComponent,
		ContextMenuComponent,
		AnnotationContextMenuComponent,
		ImageryLoaderComponent,
		ImageryTileProgressComponent,
		OverlaySourceTypeNoticeComponent
	],
	exports: [ImageriesManagerComponent]
})

export class MapFacadeModule {
	constructor() {
	}
}
