export class ExtendMap<T, V> {

	private map = new Map<T, V>();
	get keys() {
		return this.keyList();
	}

	set(t: T, v: V) {
		this.map.set(t, v);
	}

	get(t: T): V {
		return this.map.get(t);
	}


	keyList(): Array<T> {
		let keyList = [];
		const keysIterator = this.map.keys();
		let keyInstance = keysIterator.next();
		while (!keyInstance.done) {
			const key = keyInstance.value;
			keyList.push(key);
			keyInstance = keysIterator.next();
		}
		return keyList;
	}


	findKeysByValue(searchValue, arrayField?) {
		let foundInKeys = [];
		const keys = this.map.keys();
		let keyValue = keys.next();
		while (!keyValue.done) {
			const key = keyValue.value;
			const val = this.map.get(key);
			if (val) {
				switch (typeof val) {
					case 'string' : {
						if (val === searchValue) {
							foundInKeys.push(key);
						}
						break;
					}
					case 'object':
						if (Array.isArray(val) && Boolean(val.find(item => item === searchValue))) {
							foundInKeys.push(key);
						}
						else if (arrayField && val[arrayField]) {
							foundInKeys.push(key);
						}
				}
				keyValue = keys.next();
			}
		}
		return foundInKeys;
	}

	removeValueFromMap(key: T, searchValue, arrayField?) {
		// currently out of use
		let val = this.map.get(key);
		switch (typeof val) {
			case 'string' : {
				if (val === searchValue) {
					this.map.set(key, null);
				}
				break;
			}
			case 'object':
				let newValue = val;
				if (Array.isArray(val)) {
					newValue = <any>val.filter(item => item !== searchValue);
				}
				else if (arrayField && val[arrayField]) {
					const newList = <any>val[arrayField].filter(item => item !== searchValue);
					newValue[arrayField] = newList;
				}
				this.map.set(key, newValue);
		}
	}
}
