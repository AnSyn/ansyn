import { SandboxModule } from './sandbox.module';

describe('SandboxModule', () => {
	let sandboxModule: SandboxModule;

	beforeEach(() => {
		sandboxModule = new SandboxModule();
	});

	it('should create an instance', () => {
		expect(sandboxModule).toBeTruthy();
	});
});
