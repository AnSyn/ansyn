import { NgModule } from '@angular/core';
import { LoginComponent} from './login/login.component';
import { AuthGuard } from './guard/auth.guard';
import { AuthService } from './auth.service';


@NgModule({
	providers: [AuthGuard,AuthService],
	declarations: [LoginComponent],
	exports: [LoginComponent]
})

export class LoginModule {
	constructor(){}
}
