import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';

import { LoginComponent } from './login.component';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';
import 'rxjs/add/operator/catch';

describe('LoginComponent', () => {
	let component: LoginComponent;
	let fixture: ComponentFixture<LoginComponent>;
	let router: Router;
	let mockAuthService = {
		login: () => Observable.of('nothing'),
		clear: () => {
		}
	};
	let authService: AuthService;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [LoginComponent],
			imports: [RouterTestingModule, FormsModule],
			providers: [{ provide: AuthService, useValue: mockAuthService }]
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

	it('should be created', () => {
		expect(component).toBeTruthy();
	});

	it('hideTryAgainMsg should change tryAgainMsg value to false', () => {
		component.hideTryAgainMsg();
		expect(component.tryAgainMsg).toBeFalsy();
	});

	it('login functino should call login$.subscribe', () => {
		const fakeLogin$ = Observable.of('login');
		spyOn(fakeLogin$, 'subscribe');
		spyOnProperty(component, 'login$', 'get').and.callFake(() => fakeLogin$);
		component.login();
		expect(fakeLogin$.subscribe).toHaveBeenCalled();
	});


	describe('login$ should be an Observable with catch or switchMap results', () => {
		let loginObservable: any = Observable.of('ok');

		beforeEach(() => {
			spyOn(authService, 'login').and.callFake(() => loginObservable);
			spyOn(router, 'navigateByUrl').and.callFake(() => 'navigation');
			spyOn(Observable, 'fromPromise').and.callFake(() => Observable.of(''));
			spyOn(Observable, 'throw').and.callFake(() => Observable.throw);
		});

		it('on switchMap', () => {
			component.login$.subscribe(() => {
				expect(Observable.fromPromise).toHaveBeenCalledWith('navigation');
				expect(router.navigateByUrl).toHaveBeenCalled();
			});
		});

		it('on catch (throw error): should call showTryAgainMsg() and throw "Unauthorized" error Observable', () => {
			loginObservable = loginObservable.do(() => {
				throw new Error('error');
			});
			spyOn(component, 'showTryAgainMsg');
			component.login$.subscribe(() => {
				expect(component.showTryAgainMsg).toHaveBeenCalled();
				expect(Observable.throw).toHaveBeenCalledWith('Unauthorized');
			});
		});

	});

});
