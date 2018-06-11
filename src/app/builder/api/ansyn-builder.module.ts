import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { AnsynApi } from '@builder/api/ansyn-api.service';
import { builderFeatureKey, BuilderReducer } from '@builder/reducers/builder.reducer';

@NgModule({
	imports: [
		CommonModule,
		StoreModule.forFeature(builderFeatureKey, BuilderReducer),
	],
	providers: [AnsynApi]
})

export class AnsynBuilderModule {

}
