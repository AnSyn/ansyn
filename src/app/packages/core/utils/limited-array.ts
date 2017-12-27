import { cloneDeep } from 'lodash';

export interface LimitedArray {
	data: Array<any>;
	limited: number;
}

// input: array, number and (*sorting function)
// output: LimitedArray object with data property (array values up to limit) and number (how many data cells where
// sliced off thr original array)
// when (*sorting function) provided, sorting will be perform before slice
export function limitArray(arr: Array<any>, limit: number, sortFn?: (a: any, b: any) => number): LimitedArray {
	const limited = (limit < arr.length) ? arr.length - limit : 0;
	let data = cloneDeep(arr);
	if (sortFn) {
		data.sort(sortFn);	// sort before limit
	}
	if (limited > 0) {
		data = data.slice(0, limit);	// slice the part of the array beyond limit value
	}
	return { data, limited }
}

// input: array of LimitedArray objects, number and (*sorting function)
// output: LimitedArray object with data property (merged array from all input arrays up to limit) and number (how many data cells where
// sliced off the merged array)
// when (*sorting function) provided, sorting will be perform before slice
export function mergeLimitedArrays(arr: Array<LimitedArray>, limit: number, sortFn?: (a: any, b: any) => number): LimitedArray {
	let	data = [];
	let	limited = 0;
	arr.forEach(limitedArr => {
		data = data.concat(limitedArr.data);
		limited += limitedArr.limited;
	});

	const mergedLimited = (limit < data.length) ? data.length - limit : 0;
	if (sortFn) {
		data.sort(sortFn);	// sort before limit
	}
	if (mergedLimited > 0) {
		data = data.slice(0, limit);	// slice the part of the array beyond limit value
		limited += mergedLimited;		// add to total limit value
	}
	return { data, limited }
}
