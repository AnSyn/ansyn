import { AnsynBuilder, AnsynModulesNames } from './ansyn-builder';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppAnsynModule } from '../app/app.module';
import { configuration } from '../../configuration/configuration';

if (Boolean(0)) {
	platformBrowserDynamic().bootstrapModule(AppAnsynModule);
}


fetch(configuration.configPath)
	.then(response => response.json())
	.then(config => {
		const imports = new Map([
			[AnsynBuilder.AnsynModulesNames.AnsynRouterModule, null],
			[AnsynBuilder.AnsynModulesNames.RouterModule, null]

		]);
		const ansynBuilder = new AnsynBuilder('ansynMap', config, (api) => {

			},
			{
				sourceProviders: [],

			});

		});


