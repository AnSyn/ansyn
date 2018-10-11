import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppAnsynModule } from '../app/app.module';
import { AnsynBuilder } from './ansyn-builder';

if (Boolean(0)) {
	platformBrowserDynamic().bootstrapModule(AppAnsynModule);
}

window['Ansyn'] = AnsynBuilder;
