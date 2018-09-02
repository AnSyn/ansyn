import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageryModule } from '@ansyn/imagery/imagery.module';
import { OpenLayersImisightSourceProvider } from './map-source-providers/open-layers-imisight-source-provider';
import { Auth0Service } from '../../../login/services/auth0.service';
import { CallbackComponent } from '@ansyn/ansyn/app-providers/imisight/components/callback/callback.component';
import { CoreModule } from '@ansyn/core/core.module';

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
	providers: [Auth0Service],
	declarations: [CallbackComponent]
})

export class ImisightModule {
	constructor(auth0: Auth0Service) {
		auth0.handleAuthentication();
	}
}
