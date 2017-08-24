import { Injectable } from '@angular/core';
import { Router, CanActivate, Route, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable()
export class AuthGuard implements CanActivate {

	constructor(public router: Router){}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		if(localStorage.getItem('user')){
			//todo check that the token is valid
			return true;
		}

		this.router.navigate(['/login'],{queryParams: {returnUrl: state.url}});
		return false;
	}
}
