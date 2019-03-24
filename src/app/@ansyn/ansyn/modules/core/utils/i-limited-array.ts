import { cloneDeep, ListIteratee, uniqBy } from 'lodash';

export interface ILimitedArray {
	data: Array<any>;
	limited: number;
}

export interface ILimitedArrayOptions {
	sortFn?: (a: any, b: any) => number;	// sorting function
	uniqueBy?: ListIteratee<any>;			// compare by function
}

// internal function, return ILimitedArray after slice
function limitData(data, limit, limitedSoFar): ILimitedArray {
	let limited = limitedSoFar;
	if (data.length > limit) {
		limited += (data.length - limit);	// update how many items removed in total
		data = data.slice(0, limit);		// slice the part of the array beyond limit value
	}
	return { data, limited };
}

// input: array, number and (*sorting function)
// output: ILimitedArray object with data property (array values up to limit) and number (how many data cells where
// sliced off thr original array)
// when (*sorting function) provided, sorting will be perform before slice
export function limitArray(arr: Array<any>, limit: number, options?: ILimitedArrayOptions): ILimitedArray {
	let limited = 0;	// how many items removed
	let data = cloneDeep(arr);
	if (options && options.sortFn) {
		data.sort(options.sortFn);	// sort before limit
	}
	if (options && options.uniqueBy) {
		data = uniqBy(data, options.uniqueBy);
		limited = arr.length - data.length;	// update how many items removed
	}

	return limitData(data, limit, limited);
}

// input: array of ILimitedArray objects, number and (*sorting function)
// output: ILimitedArray object with data property (merged array from all input arrays up to limit) and number (how many data cells where
// sliced off the merged array)
// when (*sorting function) provided, sorting will be perform before slice
export function mergeLimitedArrays(arr: Array<ILimitedArray>, limit: number, options?: ILimitedArrayOptions): ILimitedArray {
	let data = [];
	let limited = 0;	// how many items removed
	arr.forEach(limitedArr => {
		data = data.concat(limitedArr.data);
		limited += limitedArr.limited;
	});

	if (options && options.sortFn) {
		data.sort(options.sortFn);	// sort before limit
	}
	if (options && options.uniqueBy) {
		const originalMergedArrayLength = data.length;
		data = uniqBy(data, options.uniqueBy);
		limited += (originalMergedArrayLength - data.length);	// update how many items removed
	}

	return limitData(data, limit, limited);
}
