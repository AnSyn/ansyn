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

@NgModule({
	imports: [EffectsModule.run(MapEffects), ImageryModule, CommonModule, CoreModule],
	providers: [MapFacadeService],
	declarations: [ImageriesManagerComponent, ImageryContainerComponent, ImageryStatusComponent],
	exports:[ImageriesManagerComponent]
})
export class MapFacadeModule { }
