import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { MapEffects } from './effects/map.effects';
import { MapFacadeService } from './services/map-facade.service';
import { ImageriesManagerComponent } from './components/imageries-manager/imageries-manager.component';
import { ImageryModule } from '../imagery/imagery.module';
import { CommonModule } from '@angular/common';
import { ImageryContainerComponent } from './components/imagery-container/imagery-container.component';
import { ImageryStatusComponent } from './components/imagery-status/imagery-status.component';
import { CoreModule } from '@ansyn/core';
import { ContextMenuComponent } from './components/context-menu/context-menu.component';
import { FormsModule } from '@angular/forms';

@NgModule({
	imports: [EffectsModule.run(MapEffects), ImageryModule, CommonModule, CoreModule, FormsModule],
	providers: [MapFacadeService],
	declarations: [ImageriesManagerComponent, ImageryContainerComponent, ImageryStatusComponent, ContextMenuComponent],
	exports: [ImageriesManagerComponent]
})

export class MapFacadeModule {
	constructor() {
	}
}
