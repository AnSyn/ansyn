import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { contextFeatureKey, ContextReducer } from './reducers/context.reducer';
import { ContextService } from './services/context.service';
import { HttpClientModule } from '@angular/common/http';
import { EffectsModule } from '@ngrx/effects';
import { ContextAppEffects } from './effects/context.app.effects';
import { ImageryModule } from '@ansyn/imagery';


@NgModule({
	imports: [
		StoreModule.forFeature(contextFeatureKey, ContextReducer),
		EffectsModule.forFeature([
			ContextAppEffects
		]),
		ImageryModule.provide({
			maps: [],
			mapSourceProviders: [],
			plugins: []
		})
	]
})
export class ContextModule {
}
