import { NgModule } from '@angular/core';
import { LoginComponent} from './login/login.component';
import { AuthGuard } from './guard/auth.guard';
import { AuthService } from './services/auth.service';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { LoginGuard } from './guard/login.guard';
import { LoginRoutingModule } from './login-routing.module';


@NgModule({
	imports: [
		BrowserModule,
		FormsModule,
		HttpClientModule,
		LoginRoutingModule
	],
	declarations: [LoginComponent],
	providers: [AuthGuard, AuthService]
})

export class LoginModule {
	constructor(){}
}
