import { AnsynPage } from './app.po';

describe('ansyn App', () => {
	let page: AnsynPage;

	beforeEach(() => {
		page = new AnsynPage();
	});

	it('should display message saying app works', () => {
		page.navigateTo();
		expect(page.getParagraphText()).toEqual('app works!');
	});
});
