import { browser, by, element } from 'protractor';

export class AppPage {
	private _LOGIN_COMPONENT_SELECTOR = 'ansyn-login';
	loginComponent = element(by.css(this._LOGIN_COMPONENT_SELECTOR));

	private _usernameInput = element(by.id('username'));
	private _passwordInput = element(by.id('password'));
	private _CORRECT_USERNAME = 'admin@ansyn.com';
	// Read password from environment variable
	private _CORRECT_PASSWORD = process.env['ANSYN_E2E_PASS'];
	loginButton = element(by.css('button'));

	private _MAIN_COMPONENT_SELECTOR = 'ansyn-app';
	mainComponent = element(by.css(this._MAIN_COMPONENT_SELECTOR));

	navigateTo() {
		return browser.get('/');
	}

	setUsername(newName: string) {
		this._usernameInput.sendKeys(newName);
	}

	setPassword(newPassword: string) {
		this._passwordInput.sendKeys(newPassword);
	}

	setCorrectUsername() {
		this.setUsername(this._CORRECT_USERNAME);
	}

	setCorrectPassword() {
		this.setPassword(this._CORRECT_PASSWORD);
	}
}
