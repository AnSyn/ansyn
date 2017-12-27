import { ErrorHandler, NgModule } from '@angular/core';
import { AppAnsynComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { LoginModule } from '@ansyn/login/login.module';
import { AnsynModule } from './ansyn/ansyn.module';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { BrowserModule } from '@angular/platform-browser';
import { LoggerService } from '@ansyn/core/services/logger.service';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

export function MetaReducer(reducer) {
	return function (state, action) {
		return reducer(state, action);
	};
}

export const metaReducers = [MetaReducer];

@NgModule({
	imports: [
		BrowserModule,
		StoreModule.forRoot({}, { metaReducers }),
		EffectsModule.forRoot([]),
		LoginModule,
		AnsynModule,
		AppRoutingModule,
		// For help on dev-tools see: https://github.com/ngrx/platform/blob/master/docs/store-devtools/README.md
		StoreDevtoolsModule.instrument({
			maxAge: 25 //  Retains last 25 states.
		})
	],
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
