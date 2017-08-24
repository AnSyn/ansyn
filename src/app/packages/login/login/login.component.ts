import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import {  AuthService } from '../auth.service';

@Component({
	moduleId: module.id,
	templateUrl: 'login.component.html'
})

export class LoginComponent implements OnInit {
	model: any = {};
	loading = false;
	returnUrl: string;

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private authService: AuthService,
		) { }

	ngOnInit() {
		// reset login status
		this.authService.logout();

		// get return url from route parameters or default to '/'
		this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
	}

	login() {
		this.loading = true;
		this.authService.login(this.model.username, this.model.password)
			.subscribe(
				data => {
					this.router.navigate([this.returnUrl]);
				},
				error => {
					//todo show error
					this.loading = false;
				});
	}
}
