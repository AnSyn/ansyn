import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class AuthGuard implements CanActivate {

	constructor(public router: Router, public authService: AuthService) {
	}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		return this.authService.isLoggedIn()
			.map(() => true)
			.catch(() => {
				this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
				return Observable.of(false);
			});
	}
}
