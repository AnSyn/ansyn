import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { SetLayoutAction } from '@ansyn/core';
import { AnsynBuilder } from './appBuilder/ansyn-builder';
import { AnsynModule } from '@ansyn/ansyn/ansyn.module';
import { AnsynMode, configuration } from './configuration/configuration.dev';
import { fetchConfigProviders } from '@ansyn/ansyn';
import { AppAnsynModule } from './app/app/app.module';


declare var ansynGlobal;
switch (configuration.production) {
	case AnsynMode.fullapp : {

		fetchConfigProviders().then(providers => platformBrowserDynamic(providers).bootstrapModule(AppAnsynModule));
		break;
	}
	case AnsynMode.encapsulated : {
		ansynGlobal['AnSynBuilder'] = AnsynBuilder;
		window['Ansyn'] = AnsynBuilder;
		break;
	}
	case AnsynMode.ngModule : {
		const ansynRoot = document.getElementsByTagName('ansyn-root')[0];
		document.getElementsByTagName('body')[0].style.margin = '0';
		if (ansynRoot) {
			ansynRoot.remove();
		}
		const ansynMap = new AnsynBuilder('ansynMap', '/assets/config/app.config.json');
		ansynMap.isReady$.subscribe(() => {
			ansynMap.api.store.dispatch(new SetLayoutAction('layout4'));
		});
	}
}
