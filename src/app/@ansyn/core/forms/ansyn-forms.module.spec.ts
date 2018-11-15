import { AnsynFormsModule } from './ansyn-forms.module';

describe('AnsynFormsModule', () => {
	let ansynFormsModule: AnsynFormsModule;

	beforeEach(() => {
		ansynFormsModule = new AnsynFormsModule();
	});

	it('should create an instance', () => {
		expect(ansynFormsModule).toBeTruthy();
	});
});
