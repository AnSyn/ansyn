import { ErrorHandler, NgModule } from '@angular/core';
import { AppAnsynComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AnsynModule, LoggerService } from '@ansyn/ansyn';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { LoginModule } from './login/login.module';
import { AnsynRouterModule } from './router/router.module';
import { configuration } from '../../configuration/configuration';
import { AnsynHostComponent } from './components/ansyn-host/ansyn-host.component';
import { PlaceholderComponent } from './components/placeholder/placeholder.component';
import { ImisightModule } from './imisight/imisight.module';
import { SandboxModule } from './sandbox/sandbox.module';
import { ContextModule } from './context/context.module';
import { DeviceDetectorModule } from 'ngx-device-detector';
import { SentinelModule } from './sentinel/sentinel.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
	imports: [
		BrowserAnimationsModule,
		StoreModule.forRoot({}),
		EffectsModule.forRoot([]),
		StoreDevtoolsModule.instrument({ maxAge: 200, logOnly: configuration.production }),
		AnsynModule,
		LoginModule,
		ImisightModule,
		AnsynRouterModule,
		AppRoutingModule,
		ContextModule,
		SandboxModule,
		SentinelModule,
		DeviceDetectorModule.forRoot()
	],
	providers: [
		{
			provide: ErrorHandler,
			useClass: LoggerService
		}
	],
	declarations: [AppAnsynComponent, AnsynHostComponent, PlaceholderComponent],
	exports: [AppAnsynComponent],
	bootstrap: [AppAnsynComponent]
})

export class AppAnsynModule {
}
