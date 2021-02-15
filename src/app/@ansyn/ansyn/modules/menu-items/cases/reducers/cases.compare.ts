import { difference, isEqualWith } from 'lodash';

// A comparator to be used with lodash isEqualWith
export const casesComparator = (val1, val2, key) => {
	// Ignore case updates where only extentPolygon changed, but not center or zoom
	// (in particular, pinning of the cases list causes such changes)
	if (key === 'extentPolygon') {
		return true;
	}
	// When a key is missing in an object, and in the other object is exists with value === undefined,
	// lodash isEqual makes them not equal, but we want them equal
	if (typeof val1 === 'object' && !Array.isArray(val1) && val1 !== null && val2 !== null) {
		const val1Keys = Object.keys(val1 || {});
		const val2Keys = Object.keys(val2 || {});
		const missingKeysInVal2 = difference(val1Keys, val2Keys);
		const missingKeysInVal1 = difference(val2Keys, val1Keys);
		if (missingKeysInVal1.length > 0 || missingKeysInVal2.length > 0) {
			const reduceUndefinedKeys = (prev, current) => {
				return { ...prev, [current]: undefined }
			};
			const newKeysForVal1 = missingKeysInVal1.reduce(reduceUndefinedKeys, {});
			const newKeysForVal2 = missingKeysInVal2.reduce(reduceUndefinedKeys, {});
			const isNowEqual = isEqualWith({ ...val1, ...newKeysForVal1 }, { ...val2, ...newKeysForVal2 }, casesComparator);
			return isNowEqual;
		}
	}
};
