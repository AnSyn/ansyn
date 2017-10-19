export function deepMerge(from, to, type = 'set') {
	for (let key in from) {
		if (from.hasOwnProperty(key)) {
			if (Object.prototype.toString.call(from[key]) === '[object Object]') {
				if (!to.hasOwnProperty(key)) {
					to[key] = {};
				}
				deepMerge(from[key], to[key], type);
			}
			else if (!to.hasOwnProperty(key)) {
				if (type === 'merge') {
					to[key] = from[key];
				}
				else {
					if (Boolean(from[key] instanceof Array)) {
						to[key] = [];
					} else {
						to[key] = undefined;
					}
				}
			}
		}
	}
	return to;
}
