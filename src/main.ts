import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppAnsynModule } from './app/app.module';
import { fetchConfigProviders } from './app/app-providers';

fetchConfigProviders.then(providers => platformBrowserDynamic(providers).bootstrapModule(AppAnsynModule));
