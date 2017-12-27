import { AppPage } from './app.po';
import { by, element } from 'protractor';

describe('Ansyn App', () => {
	let page: AppPage;

	beforeEach(() => {
		page = new AppPage();
		page.navigateTo();
	});

	it('should initialize app with login', async () => {
		const isPresent = await element(by.css('ansyn-login')).isPresent();
		expect(isPresent).toBe(true);
	});
});
