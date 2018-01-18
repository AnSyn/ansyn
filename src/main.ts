import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { fetchConfigProviders } from '@ansyn/app/app-providers';
import { AppAnsynModule } from '@ansyn/app/app.module';

fetchConfigProviders().then(providers => platformBrowserDynamic(providers).bootstrapModule(AppAnsynModule));
