import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OpenLayersImisightSourceProvider } from './map-source-providers/open-layers-imisight-source-provider';
import { CoreModule } from '@ansyn/core';
import { ImageryModule } from '@ansyn/imagery';
import { CallbackComponent } from './components/callback/callback.component';
import { Auth0Service } from './auth0.service';

@NgModule({
	imports: [
		CommonModule,
		CoreModule,
		ImageryModule.provide({
			mapSourceProviders: [
				OpenLayersImisightSourceProvider
			],
			plugins: [],
			maps: []
		})
	],
	declarations: [CallbackComponent]
})

export class ImisightModule {
	constructor(auth0: Auth0Service) {
		auth0.handleAuthentication();
	}
}
