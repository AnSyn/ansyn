import { Component, Inject, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { fromPromise } from 'rxjs/internal/observable/fromPromise';
import { catchError, filter, map, switchMap, mergeMap } from 'rxjs/operators';
import { LoginConfig } from '../services/login-config.service';
import { ILoginConfig } from '../models/login.config';

@Component({
	selector: 'ansyn-login',
	styleUrls: ['./login.component.less'],
	templateUrl: 'login.component.html'
})

export class LoginComponent implements OnInit {

	username: string;
	password: string;
	rememberMe: boolean;
	returnUrl = this.authService.authorizedPath;
	returnUrl$: Observable<string> = this.activatedRoute
		.queryParamMap.pipe(
			map((map: ParamMap) => map.get('returnUrl')),
			filter(_returnUrl => Boolean(_returnUrl))
		);

	tryAgainMsg: boolean;

	constructor(protected authService: AuthService,
				protected activatedRoute: ActivatedRoute,
				@Inject(LoginConfig) public config: ILoginConfig,
				protected router: Router) {
	}

	ngOnInit(): void {
		this.returnUrl$.subscribe(_returnUrl => {
			this.returnUrl = _returnUrl;
		});
		this.authService.clear();
	}

	loginRequest(): Observable<any> {
		return this.authService.login(this.username, this.password, this.rememberMe).pipe(
			mergeMap(() => fromPromise(this.router.navigateByUrl(this.returnUrl))),
			catchError(() => {
				this.showTryAgainMsg();
				return throwError('Unauthorized');
			})
		);
	}

	hideTryAgainMsg() {
		this.tryAgainMsg = false;
	}

	showTryAgainMsg() {
		this.tryAgainMsg = true;
	}

	login(): void {
		this.loginRequest().subscribe();
	}

}
