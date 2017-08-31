import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';

@Component({
	selector: 'ansyn-login',
	styleUrls: ['./login.component.less'],
	templateUrl: 'login.component.html'
})

export class LoginComponent implements OnInit {

	username: string;
	password: string;
	rememberMe: boolean;
	returnUrl = '';
	returnUrl$: Observable<string> = this.activatedRoute
		.queryParams
		.pluck('returnUrl');
	tryAgainMsg: boolean;

	constructor(private authService: AuthService,
				private activatedRoute: ActivatedRoute,
				private router: Router) { }

	ngOnInit(): void {
		this.returnUrl$.subscribe(_returnUrl => {this.returnUrl = _returnUrl});
		this.authService.clear()
	}

	get login$() {
		return this.authService.login(this.username, this.password, this.rememberMe)
			.catch(() => {
				this.tryAgainMsg = true;
				return Observable.throw('Unauthorized');
			})
			.switchMap(() => {
				return Observable.fromPromise(this.router.navigate([this.returnUrl]))
			})
	}

	hideTryAgainMsg() {
		this.tryAgainMsg = false;
	}

	login(): void {
		this.login$.subscribe();
	}

}
