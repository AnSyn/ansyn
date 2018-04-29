import { fetchConfigProviders } from '@ansyn/ansyn/app-providers/fetch-config-providers';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { PrivateAnsynAppModule } from './ansyn-private.module';

fetchConfigProviders().then((providers) => platformBrowserDynamic(providers).bootstrapModule(PrivateAnsynAppModule));
