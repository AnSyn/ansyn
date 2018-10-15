import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class UnAuthGuard implements CanDeactivate<any> {

	constructor(public router: Router, public authService: AuthService) {
	}

	canDeactivate(component: any, currentRoute: ActivatedRouteSnapshot, currentState: RouterStateSnapshot, nextState?: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
		return this.authService.isLoggedIn().pipe(
			map(() => false),
			catchError(() => of(true))
		);
	}
}
