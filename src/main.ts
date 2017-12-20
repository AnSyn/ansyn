import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppAnsynModule } from '@ansyn/app';
import { fetchConfigProviders } from '@ansyn/app/app-providers';

fetchConfigProviders().then(providers => platformBrowserDynamic(providers).bootstrapModule(AppAnsynModule));
