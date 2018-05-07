import { AnsynBuilder, AnsynModulesNames } from './ansyn-builder';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppAnsynModule } from '../app/app.module';

if (Boolean(0)) {
	platformBrowserDynamic().bootstrapModule(AppAnsynModule);
}


fetch('/assets/config/app.config.json')
	.then(response => response.json())
	.then(config => {
		const imports = new Map([
			[AnsynBuilder.AnsynModulesNames.AnsynRouterModule, null],
			[AnsynBuilder.AnsynModulesNames.RouterModule, null]

		]);
		const ansynBuilder = new AnsynBuilder('ansynMap', config, (api) => {
			setTimeout(() => {
				const position = [-117.89788973855977, 33.77329129691691];

				api.goToPosition(position)
			}, 7000)
			},
			{
				sourceProviders: [],

			});

		});


