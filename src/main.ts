import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppAnsynModule } from './app/app/app.module';
import { fetchConfigProviders } from '@ansyn/core';
import { enableProdMode } from '@angular/core';
import { configuration } from './configuration/configuration';

if (configuration.production) {
	enableProdMode();
}

fetchConfigProviders(configuration.configPath).then(providers => platformBrowserDynamic(providers).bootstrapModule(AppAnsynModule));
