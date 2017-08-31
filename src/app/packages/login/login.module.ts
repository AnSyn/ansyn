import { NgModule } from '@angular/core';
import { LoginComponent} from './login/login.component';
import { AuthGuard } from './guard/auth.guard';
import { AuthService } from './auth.service';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';


@NgModule({
	providers: [AuthGuard,AuthService],
	imports: [BrowserModule, FormsModule],
	declarations: [LoginComponent]
})

export class LoginModule {
	constructor(){}
}
