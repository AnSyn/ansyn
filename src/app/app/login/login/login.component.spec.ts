import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';

import { LoginComponent } from './login.component';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { LoginConfig } from '../services/login-config.service';

describe('LoginComponent', () => {
	let component: LoginComponent;
	let fixture: ComponentFixture<LoginComponent>;
	let router: Router;
	let mockAuthService = {
		login: () => of('nothing'),
		clear: () => {
		}
	};
	let authService: AuthService;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [LoginComponent],
			imports: [RouterTestingModule, FormsModule],
			providers: [
				{ provide: AuthService, useValue: mockAuthService },
				{ provide: LoginConfig, useValue: {} }
			]
		})
			.compileComponents();
	}));

	beforeEach(inject([Router, AuthService], (_router: Router, _authService: AuthService) => {
		fixture = TestBed.createComponent(LoginComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		router = _router;
		authService = _authService;
	}));

	afterEach(() => {
		component.username = '';
		component.password = '';
		component.rememberMe = undefined;
	});

	it('should be created', () => {
		expect(component).toBeTruthy();
	});

	it('hideTryAgainMsg should change tryAgainMsg value to false', () => {
		component.hideTryAgainMsg();
		expect(component.tryAgainMsg).toBeFalsy();
	});

	it('login functino should call login$.subscribe', () => {
		const fakeLogin$ = of('login');
		spyOn(fakeLogin$, 'subscribe');
		spyOn(component, 'loginRequest').and.callFake(() => fakeLogin$);
		component.login();
		expect(fakeLogin$.subscribe).toHaveBeenCalled();
	});


	describe('loginRequest should be an Observable with catch or mergeMap results', () => {
		it('on mergeMap', async(async () => {
			spyOn(authService, 'login').and.callFake(() => of('ok'));
			spyOn(router, 'navigateByUrl').and.callFake(() => Promise.resolve(true));
			component.username = 'username';
			component.password = 'password';
			component.rememberMe = false;

			await (component.loginRequest()).toPromise();
			expect(authService.login).toHaveBeenCalledWith('username', 'password', false);
			expect(router.navigateByUrl).toHaveBeenCalled();
		}));

		it('on catch (throw error): should call showTryAgainMsg() and throw "Unauthorized" error Observable', async(async () => {
			spyOn(authService, 'login').and.callFake(() => throwError(new Error('error')));
			spyOn(component, 'showTryAgainMsg');
			try {
				await (component.loginRequest()).toPromise();
			} catch (e) {
				expect(component.showTryAgainMsg).toHaveBeenCalled();
			}
		}));

	});

});
