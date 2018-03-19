import { AppPage } from './app.po';

describe('Ansyn App', () => {
	let page: AppPage;

	beforeEach(() => {
		page = new AppPage();
		page.navigateTo();
	});

	it('should initialize app with login', () => {
		const isPresent = page.loginComponent.isPresent();
		expect(isPresent).toBe(true);
	});

	it('should instantiate the main app component, after a successful login', () => {
		page.setCorrectUsername();
		page.setCorrectPassword();
		page.loginButton.click();
		const isPresent = page.mainComponent.isPresent();
		expect(isPresent).toBe(true);
	});
});
