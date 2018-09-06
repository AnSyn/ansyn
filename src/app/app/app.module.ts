import { ErrorHandler, NgModule } from '@angular/core';
import { AppAnsynComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AnsynModule } from '@ansyn/ansyn/ansyn.module';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { BrowserModule } from '@angular/platform-browser';
import { LoggerService } from '@ansyn/core/services/logger.service';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { configuration } from 'configuration/configuration';
import { LoginModule } from './login/login.module';
import { AnsynRouterModule } from './router/router.module';

@NgModule({
	imports: [
		BrowserModule,
		StoreModule.forRoot({}),
		EffectsModule.forRoot([]),
		StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: configuration.production }),
		AnsynModule,
		LoginModule,
		AnsynRouterModule,
		AppRoutingModule
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
}
