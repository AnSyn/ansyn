import { AnsynDatePipe } from './ansyn-date.pipe';

describe('AnsynDatePipe', () => {
	let myPipe: AnsynDatePipe;

	beforeEach(() => {
		myPipe = new AnsynDatePipe('en-GB');
	});

	it('create an instance', () => {
		expect(myPipe).toBeTruthy();
	});

	it('will return expected value', () => {
		expect(myPipe.transform(new Date(0))).toEqual('01/01/1970 02:00');
	});

});
