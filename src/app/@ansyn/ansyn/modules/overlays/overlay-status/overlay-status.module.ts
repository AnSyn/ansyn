import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MapFacadeModule } from '@ansyn/map-facade';
import { ComponentTranslateLoader } from '../../../../translation/loaders/component-translate-loader';
import { AnsynTranslationModule } from '../../../../translation/ansyn-translation.module';
import { BackToBaseMapComponent } from './components/back-to-base-map/back-to-base-map.component';
import { OverlayStatusEffects } from './effects/overlay-status.effects';
import { OverlayStatusComponent } from './overlay-status.component';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { overlayStatusFeatureKey, OverlayStatusReducer } from './reducers/overlay-status.reducer';

@NgModule({
	declarations: [OverlayStatusComponent, BackToBaseMapComponent],
	entryComponents: [OverlayStatusComponent, BackToBaseMapComponent],
	imports: [
		CommonModule,
		StoreModule.forFeature(overlayStatusFeatureKey, OverlayStatusReducer),
		EffectsModule.forFeature([OverlayStatusEffects]),
		MapFacadeModule.provide({
			entryComponents: {
				status: [OverlayStatusComponent, BackToBaseMapComponent],
				container: []
			}
		}),
		AnsynTranslationModule.addLoader([ComponentTranslateLoader])
	]
})
export class OverlayStatusModule {
}
