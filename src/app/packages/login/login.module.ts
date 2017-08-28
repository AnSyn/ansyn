import { NgModule } from '@angular/core';
import { LoginComponent} from './login/login.component';
import { AuthGuard } from './guard/auth.guard';
import { Route, Router } from '@angular/router';
import { AuthService } from './auth.service';


@NgModule({
	imports: [ Router],
	providers: [AuthGuard,AuthService],
	declarations: [LoginComponent],
	exports: [LoginComponent]
})

export class LoginModule {
	constructor(){}
}
