import { NgModule } from '@angular/core';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { AuthService } from './services/auth.service';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { UnAuthGuard } from './guards/unauth.guard';
import { LoginConfigService } from './services/login-config.service';

@NgModule({
	imports: [
		BrowserModule,
		FormsModule,
		HttpClientModule
	],
	declarations: [LoginComponent],
	providers: [AuthGuard, AuthService, UnAuthGuard, LoginConfigService]
})

export class LoginModule {

}
