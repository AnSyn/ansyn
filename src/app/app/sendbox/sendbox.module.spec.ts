import { SendboxModule } from './sendbox.module';

describe('SendboxModule', () => {
	let sendboxModule: SendboxModule;

	beforeEach(() => {
		sendboxModule = new SendboxModule();
	});

	it('should create an instance', () => {
		expect(sendboxModule).toBeTruthy();
	});
});
