export class ExtendMap<T, V> {

	private map: Map<T, V>;

	constructor(extendMap?: ExtendMap<T, V>) {
		const copyMap = (extendMap && extendMap.map);
		this.map = new Map<T, V>(copyMap);
	}

	get keys(): T[] {
		return Array.from(this.map.keys());
	}

	values() {
		return this.map.values();
	}

	set(t: T, v: V) {
		this.map.set(t, v);
	}

	get(t: T): V {
		return this.map.get(t);
	}

	has(t: T): boolean {
		return this.map.has(t);
	}

	forEach(cb) {
		this.map.forEach(cb);
	}

	findKeysByValue(searchValue, arrayField = 'overlaysIds'): T[] {
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

	trimMap(size) {
		if (this.map.size < size) {
			return;
		}
		else {
			let arr = Array.from(this.map).filter((val, index) => index < size);
			this.map = new Map();
			arr.forEach(val => this.map.set(val[0], val[1]));
		}
	}
}
