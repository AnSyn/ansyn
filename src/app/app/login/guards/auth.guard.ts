import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class AuthGuard implements CanActivate {

	constructor(public router: Router, public authService: AuthService) {
	}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		return this.authService.isLoggedIn().pipe(
			map(() => true),
			catchError(() => {
				this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
				return of(false);
			})
		);
	}
}
