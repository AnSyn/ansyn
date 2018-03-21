import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { SetLayoutAction } from '@ansyn/core';
import { AnsynBuilder } from './appBuilder/ansyn-builder';
import { AnsynModule } from '@ansyn/ansyn/ansyn.module';
import { configuration } from './configuration/configuration.dev';


declare var ansynGlobal;
if (!configuration.production) {
	const ansynMap = new AnsynBuilder('ansynMap', '/assets/config/app.config.json');
	ansynMap.isReady$.subscribe(() => {
		ansynMap.api.store.dispatch(new SetLayoutAction('layout4'));
	});
}
else {
	ansynGlobal['AnSynBuilder'] = AnsynBuilder;
}

// This is a hack!
if ("") {
	platformBrowserDynamic().bootstrapModule(AnsynModule);
}

window['Ansyn'] = AnsynBuilder;
