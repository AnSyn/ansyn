import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { fetchConfigProviders } from 'ansyn/src/app/app-providers';

if (environment.production) {
  enableProdMode();
}

fetchConfigProviders.then(providers => platformBrowserDynamic(providers).bootstrapModule(AppModule));
