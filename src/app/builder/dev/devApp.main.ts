import { AnsynBuilder } from '../api/ansyn-builder';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppAnsynModule } from '../../app/app.module';
import { configuration } from '../../../configuration/configuration';

if (Boolean(0)) {
	platformBrowserDynamic().bootstrapModule(AppAnsynModule);
}


fetch(configuration.configPath)
	.then(response => response.json())
	.then(config => {
		const ansynBuilder = new AnsynBuilder({ id: 'ansynMap', config, callback: (api) => {}, options: { sourceProviders: [] } });
	});


