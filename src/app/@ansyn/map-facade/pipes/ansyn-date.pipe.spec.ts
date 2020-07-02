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
		const inputDate = new Date(98, 2, 12, 3, 13);
		const outputStr = '12/03/1998 03:13';
		expect(myPipe.transform(inputDate)).toEqual(outputStr);
	});

});
