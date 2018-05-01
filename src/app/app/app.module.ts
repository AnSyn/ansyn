import { enableProdMode, ErrorHandler, NgModule } from '@angular/core';
import { AppAnsynComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AnsynModule } from '@ansyn/ansyn/ansyn.module';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { BrowserModule } from '@angular/platform-browser';
import { LoggerService } from '@ansyn/core/services/logger.service';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { configuration } from '../../configuration/configuration';
import { LoginModule } from '@ansyn/login/login.module';

export function MetaReducer(reducer) {
	return function (state, action) {
		return reducer(state, action);
	};
}

export const imports = [
	BrowserModule,
	StoreModule.forRoot({}, { metaReducers: [MetaReducer] }),
	EffectsModule.forRoot([]),
	LoginModule,
	AnsynModule,
	AppRoutingModule
];

if (configuration.production) {
	enableProdMode();
} else {
	imports.push(StoreDevtoolsModule.instrument({ maxAge: 25 }));
}

export const AnsynAppMetaData = {
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
};

@NgModule(AnsynAppMetaData)
export class AppAnsynModule {
	constructor(protected loggerService: LoggerService) {
		window.onerror = function (e) {
			loggerService.error(e.toString());
		};
	}
}
