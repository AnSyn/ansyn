import { AnsynBuilder } from '../api/ansyn-builder';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppAnsynModule } from '../../app/app.module';
import { configuration } from '../../../configuration/configuration';

if (Boolean(0)) {
	platformBrowserDynamic().bootstrapModule(AppAnsynModule);
}

let ansynBuilder: AnsynBuilder;
let config;

export const init = () => {
	ansynBuilder = new AnsynBuilder({ id: 'ansynMap', config, callback: _callback, options: { sourceProviders: [] } });
};

const _callback = () => {
	document.querySelector('#destroy').addEventListener('click', () => {
		ansynBuilder.api.destroy();
	});

	document.querySelector('#init').addEventListener('click', () => {
		init();
	});
};

fetch(configuration.configPath)
	.then(response => response.json())
	.then(_config => {
		config = _config;
		init()
	});
