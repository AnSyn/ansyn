import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
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

	constructor(private authService: AuthService,
				private activatedRoute: ActivatedRoute,
				private router: Router) { }

	ngOnInit(): void {
		this.returnUrl$.subscribe(_returnUrl => {
			this.returnUrl = _returnUrl;
		});
	}

	login(): void {
		this.authService.login(this.username, this.password, this.rememberMe)
			.switchMap(() => Observable.fromPromise(this.router.navigate([this.returnUrl])))
			.subscribe();
	}

}
