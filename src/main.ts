import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppAnsynModule } from './app/app/app.module';
import { fetchConfigProviders } from '@ansyn/ansyn/app-providers/fetch-config-providers';
import { enableProdMode } from '@angular/core';
import { configuration } from './configuration/configuration';

if (configuration.production) {
	enableProdMode();
}

fetchConfigProviders().then(providers => platformBrowserDynamic(providers).bootstrapModule(AppAnsynModule));
