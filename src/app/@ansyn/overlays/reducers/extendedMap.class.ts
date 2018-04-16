export class ExtendMap<T, V> {

	private map = new Map<T, V>();

	get keys() {
		return Array.from(this.map.keys())
	}

	set(t: T, v: V) {
		this.map.set(t, v);
	}

	get(t: T): V {
		return this.map.get(t);
	}



	findKeysByValue(searchValue, arrayField) {
		return Array.from(this.map)
			.filter(([key, val]) => Boolean(val && val[arrayField] && val[arrayField].some(item => item === searchValue)))
			.map(([key, val]) => key)

	}


	removeValueFromMap(key: T, searchValue, arrayField) {
		// currently out of use
		return Array.from(this.map)
			.filter(([key, val]) => Boolean(val && val[arrayField] && val[arrayField].find(item => item === searchValue)))
			.forEach(([key, val]) => {
				val[arrayField] = val[arrayField].filter(item => item !== searchValue);
				this.map.set(key, val);
			})
	}
}
