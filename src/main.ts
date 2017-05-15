import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { configuration } from './configuration/configuration';

if (configuration.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule);

