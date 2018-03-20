import { AppPage } from './app.po';
import { browser } from "protractor";

describe('Ansyn App', () => {
	let page: AppPage;

	beforeEach(() => {
		page = new AppPage();
		page.navigateTo();
	});

	it('should initialize app with login', () => {
		expect(page.loginComponent.isPresent()).toBe(true);
	});

	it('should instantiate the main app component, after a successful login', () => {
		page.setCorrectUsername();
		page.setCorrectPassword();
		page.loginButton.click();
		browser.wait(
			() => page.mainComponent.isPresent(),
			null,
			'Timed out waiting for main component'
		);
		expect(page.mainComponent.isPresent()).toBe(true);
	});
});
