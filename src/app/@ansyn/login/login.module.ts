import { NgModule } from '@angular/core';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { AuthService } from './services/auth.service';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { UnAuthGuard } from './guards/unauth.guard';
import { LoginConfigService } from './services/login-config.service';
import { Auth0Service } from '@ansyn/login/services/auth0.service';

@NgModule({
	imports: [
		BrowserModule,
		FormsModule,
		HttpClientModule
	],
	declarations: [LoginComponent],
	providers: [AuthGuard, AuthService, Auth0Service, UnAuthGuard, LoginConfigService]
})

export class LoginModule {

}
