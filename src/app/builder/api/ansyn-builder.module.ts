import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { builderFeatureKey, BuilderReducer } from '../reducers/builder.reducer';
import { ANSYN_BUILDER_ID, AnsynApi } from './ansyn-api.service';

@NgModule({
	imports: [
		CommonModule,
		StoreModule.forFeature(builderFeatureKey, BuilderReducer),
	],
	providers: [AnsynApi]
})

export class AnsynBuilderModule {

	static provideId(id: string): ModuleWithProviders {
		return {
			ngModule: AnsynBuilderModule,
			providers: [
				{
					provide: ANSYN_BUILDER_ID,
					useValue: id
				}
			]
		}
	}
}
