export class ExtendMap<T, V> {

	private map: Map<T, V>;

	constructor(extendMap?: ExtendMap<T, V>) {
		const copyMap = (extendMap && extendMap.map);
		this.map = new Map<T, V>(copyMap);
	}

	get keys(): T[] {
		return Array.from(this.map.keys());
	}

	set(t: T, v: V) {
		this.map.set(t, v);
	}

	get(t: T): V {
		return this.map.get(t);
	}


	findKeysByValue(searchValue, arrayField = 'overlaysIds') {
		return Array.from(this.map)
			.filter(([key, val]) => Boolean(val && val[arrayField] && val[arrayField].some(item => item === searchValue)))
			.map(([key]) => key);

	}


	removeValueFromMap(key: T, searchValue, arrayField) {
		// currently out of use
		return Array.from(this.map)
			.filter(([key, val]) => Boolean(val && val[arrayField]))
			.forEach(([key, val]) => {
				val[arrayField] = val[arrayField].filter(item => item !== searchValue);
				this.map.set(key, val);
			});
	}
}
