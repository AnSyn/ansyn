import { ImisightModule } from './imisight.module';

describe('ImisightModule', () => {
	let imisightModule: ImisightModule;

	beforeEach(() => {
		imisightModule = new ImisightModule();
	});

	it('should create an instance', () => {
		expect(imisightModule).toBeTruthy();
	});
});
