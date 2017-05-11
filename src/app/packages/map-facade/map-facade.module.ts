import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { MapEffects } from './effects/map.effects';
import { MapFacadeService } from './services/map-facade.service';

@NgModule({
	imports: [EffectsModule.run(MapEffects)],
	providers: [MapFacadeService]
})
export class MapFacadeModule { }
