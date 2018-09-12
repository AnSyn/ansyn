import { ModuleWithProviders, NgModule } from '@angular/core';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { AuthService } from './services/auth.service';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { UnAuthGuard } from './guards/unauth.guard';
import { LoginConfig, LoginConfigService } from './services/login-config.service';
import { ILoginConfig } from './models/login.config';
import { configuration } from '../../../configuration/configuration';

@NgModule({
	imports: [
		BrowserModule,
		FormsModule,
		HttpClientModule
	],
	declarations: [LoginComponent],
	providers: [AuthGuard, AuthService, UnAuthGuard, LoginConfigService, {
		provide: LoginConfig,
		useValue: configuration.loginConfig
	}]
})

export class LoginModule {
	static forRoot(config: ILoginConfig): ModuleWithProviders {
		return {
			ngModule: LoginModule,
			providers: [
				{ provide: LoginConfig, useValue: config }
			]
		};
	}
}
