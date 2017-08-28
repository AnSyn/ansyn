import { Injectable } from '@angular/core';
import { Router, CanActivate, Route, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../auth.service';

@Injectable()
export class AuthGuard implements CanActivate {

	constructor(public router: Router,public authService:AuthService){}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		//if(localStorage.getItem('user')){
			//todo check that the token is valid
		if(this.authService.check(localStorage.getItem('userToken'))){
			return true;
		}

		//}

		this.router.navigate(['/login'],{queryParams: {returnUrl: state.url}});
		return false;
	}
}
