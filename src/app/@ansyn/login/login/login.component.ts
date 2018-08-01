import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Observable } from 'rxjs';
import 'rxjs/add/observable/fromPromise';
import { Auth0Service } from '@ansyn/login/services/auth0.service';

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
		.queryParamMap
		.map((map: ParamMap) => map.get('returnUrl'))
		.filter(_returnUrl => Boolean(_returnUrl));

	tryAgainMsg: boolean;

	constructor(protected authService: AuthService,
				protected activatedRoute: ActivatedRoute,
				protected router: Router,
				protected auth0Service: Auth0Service) {
	}

	ngOnInit(): void {
		this.returnUrl$.subscribe(_returnUrl => {
			this.returnUrl = _returnUrl;
		});
		this.authService.clear();
	}

	get login$() {
		return this.authService.login(this.username, this.password, this.rememberMe)
			.switchMap(() => Observable.fromPromise(this.router.navigateByUrl(this.returnUrl)))
			.do(() => this.auth0Service.login())
			.catch(() => {
				this.showTryAgainMsg();
				return Observable.throw('Unauthorized');
			});
	}

	hideTryAgainMsg() {
		this.tryAgainMsg = false;
	}

	showTryAgainMsg() {
		this.tryAgainMsg = true;
	}

	login(): void {
		this.login$.subscribe();
	}

}
