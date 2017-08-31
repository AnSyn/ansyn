import { Injectable } from '@angular/core';
import { Router, CanActivate, Route, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class LoginGuard implements CanActivate {

	constructor(public router: Router,public authService:AuthService){}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		return this.authService.isLoggedIn()
			.map(() => {
				this.router.navigate(['/']);
				return false;
			})
			.catch(() => Observable.of(true));
	}
}
