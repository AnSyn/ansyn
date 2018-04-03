import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import { ICoreState } from '@ansyn/core/reducers/core.reducer';
import { Store } from '@ngrx/store';
import { SetIsAfterLoginFlagAction } from '@ansyn/core';

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
				protected store$: Store<ICoreState>) {
	}

	ngOnInit(): void {
		this.returnUrl$.subscribe(_returnUrl => {
			this.returnUrl = _returnUrl;
		});
		this.authService.clear();
	}

	get login$() {
		return this.authService.login(this.username, this.password, this.rememberMe)
			.do(() => {
				this.store$.dispatch(new SetIsAfterLoginFlagAction(true));
			})
			.switchMap(() => Observable.fromPromise(this.router.navigateByUrl(this.returnUrl)))
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
