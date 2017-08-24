import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { configuration } from './configuration/configuration';

import { TmpConfig } from './app/app.module';

if (configuration.production) {
  enableProdMode();
}

fetch("/assets/config/config.json").then(response => {
	return response.json();
}).then(config => {
	platformBrowserDynamic([
		{ provide:TmpConfig, useValue:config }
	]).bootstrapModule(AppModule);
});


