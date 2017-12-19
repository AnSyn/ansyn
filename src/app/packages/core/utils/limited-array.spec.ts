import { cloneDeep } from 'lodash';
import { limitArray, mergeLimitedArrays } from './limited-array';

describe('limitArray function: ', () => {
	let arr;

	beforeEach(() => {
		arr = [1, 2, 3, 4, 5, 6, 7];
	});

	it('check result object', () => {
		const limitValue =  4;
		const expectedLimited =  arr.length - limitValue;
		const limitedArr =  limitArray(arr, limitValue);

		expect(limitedArr.data).toEqual(arr.slice(0, limitValue));
		expect(limitedArr.limited).toEqual(expectedLimited);
	});

	it('function should be pure', () => {
		const originalArr = arr.slice();
		limitArray(arr, 4);

		expect(arr).toEqual(originalArr);
	});
});

describe('mergeLimitedArrays function: ', () => {
	let limitedArrays;

	beforeEach(() => {
		limitedArrays = [
			{ data: [1, 2, 3, 4], limited: 3 },
			{ data: ['a', 'b', 'c'], limited: 2 }
		];
	});

	it('check result object', () => {
		const limitValue =  6;
		const mergedArr = limitedArrays[0].data.concat(limitedArrays[1].data);
		const expectedLimited = limitedArrays[0].limited + limitedArrays[1].limited + (mergedArr.length - limitValue);

		const result = mergeLimitedArrays(limitedArrays, limitValue);

		expect(result.data).toEqual(mergedArr.slice(0, limitValue));
		expect(result.limited).toEqual(expectedLimited);
	});

	it('function should be pure', () => {
		const originalArr = cloneDeep(limitedArrays);
		mergeLimitedArrays(limitedArrays, 7);

		expect(limitedArrays).toEqual(originalArr);
	});
});
