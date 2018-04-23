import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { fetchConfigProviders } from '@ansyn/ansyn/app-providers';
import { AppAnsynModule } from './app/app/app.module';

fetchConfigProviders().then(providers => platformBrowserDynamic(providers).bootstrapModule(AppAnsynModule));
