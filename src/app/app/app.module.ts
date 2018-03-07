import { enableProdMode, ErrorHandler, NgModule } from '@angular/core';
import { AppAnsynComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AnsynModule } from '@ansyn/ansyn/ansyn.module';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { BrowserModule } from '@angular/platform-browser';
import { LoggerService } from '@ansyn/core/services/logger.service';
import { LoginModule } from '@ansyn/login';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { configuration } from '../../configuration/configuration';

export function MetaReducer(reducer) {
	return function (state, action) {
		return reducer(state, action);
	};
}

export const metaReducers = [MetaReducer];

const imports = [
	BrowserModule,
	StoreModule.forRoot({}, { metaReducers }),
	EffectsModule.forRoot([]),
	LoginModule,
	AnsynModule,
	AppRoutingModule
];
if (configuration.production) {
	enableProdMode();
} else {
	// For help on dev-tools see: https://github.com/ngrx/platform/blob/master/docs/store-devtools/README.md
	imports.push(StoreDevtoolsModule.instrument({
		maxAge: 25 //  Retains last 25 states.
	}));
	console.log('NGRX Store Dev-tools Module enabled');
}

@NgModule({
	imports,
	providers: [
		{
			provide: ErrorHandler,
			useClass: LoggerService
		}
	],
	declarations: [AppAnsynComponent],
	exports: [AppAnsynComponent],
	bootstrap: [AppAnsynComponent]
})

export class AppAnsynModule {
	constructor(protected loggerService: LoggerService) {
		window.onerror = function (e) {
			loggerService.error(e.toString());
		};
	}
}
