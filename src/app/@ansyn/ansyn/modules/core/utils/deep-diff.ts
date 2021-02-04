/*
 Based on https://stackoverflow.com/a/8596559/4402222
 deepDiffMapper.map() deep-compares two JS objects
 returns an object with only the differences
*/
export const deepDiffMapper = function () {
	return {
		VALUE_CREATED: 'created',
		VALUE_UPDATED: 'updated',
		VALUE_DELETED: 'deleted',
		VALUE_UNCHANGED: 'unchanged',
		map: function (obj1, obj2) {
			if (this.isFunction(obj1) || this.isFunction(obj2)) {
				throw Error('Invalid argument. Function given, object expected.');
			}
			if (this.isValue(obj1) || this.isValue(obj2)) {
				const fromResult = this.compareValues(obj1, obj2);
				let toResult;
				switch (fromResult) {
					case this.VALUE_UNCHANGED:
						toResult = undefined;
						break;
					case this.VALUE_CREATED:
						toResult = {
							type: fromResult,
							data: obj2
						};
						break;
					case this.VALUE_DELETED:
						toResult = {
							type: fromResult,
							data: obj1
						};
						break;
					default:
						toResult = {
							type: fromResult,
							from: obj1,
							to: obj2
						}
				}
				return toResult;
			}

			const diff = {};
			const unchanged = new Set();
			for (let key in obj1) {
				if (this.isFunction(obj1[key])) {
					continue;
				}

				if (!obj2.hasOwnProperty(key)) {
					diff[key] = {
						type: this.VALUE_DELETED,
						data: obj1[key]
					};
					continue;
				}

				const value2 = obj2[key];
				const result = this.map(obj1[key], value2);
				if (result) {
					diff[key] = result
				} else {
					unchanged.add(key);
				}
			}
			for (let key in obj2) {
				if (this.isFunction(obj2[key]) || diff[key] !== undefined || unchanged.has(key)) {
					continue;
				}

				if (!obj1.hasOwnProperty(key)) {
					diff[key] = {
						type: this.VALUE_CREATED,
						data: obj2[key]
					};
					continue;
				}

				const result = this.map(undefined, obj2[key]);
				if (result) {
					diff[key] = result
				}
			}

			if (Object.keys(diff).length === 0) { // {}
				return undefined
			} else {
				return diff
			}

		},
		compareValues: function (value1, value2) {
			if (value1 === value2) {
				return this.VALUE_UNCHANGED;
			}
			if (this.isDate(value1) && this.isDate(value2) && value1.getTime() === value2.getTime()) {
				return this.VALUE_UNCHANGED;
			}
			if (value1 === undefined) {
				return this.VALUE_CREATED;
			}
			if (value2 === undefined) {
				return this.VALUE_DELETED;
			}
			return this.VALUE_UPDATED;
		},
		isFunction: function (x) {
			return Object.prototype.toString.call(x) === '[object Function]';
		},
		isArray: function (x) {
			return Object.prototype.toString.call(x) === '[object Array]';
		},
		isDate: function (x) {
			return Object.prototype.toString.call(x) === '[object Date]';
		},
		isObject: function (x) {
			return Object.prototype.toString.call(x) === '[object Object]';
		},
		isValue: function (x) {
			return !this.isObject(x) && !this.isArray(x);
		}
	}
}();
