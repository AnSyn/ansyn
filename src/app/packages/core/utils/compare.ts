interface Array<T> {
        equals(array: Array<T>);
}

interface Map<K,V> {
    equals(map: Map<K,V>);
}

Array.prototype.equals = function (array: Array<any>): boolean {
    // if the other array is a falsy value, return
    if (!array){
		return false;
	}

    // compare lengths - can save a lot of time
    if (this.length !== array.length){
		return false;
	}

    for (let i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i])){
				return false;
			}
        }
        else if (this[i] !== array[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
}

Map.prototype.equals = function (map):boolean {
    let testVal;
    if (this.size !== map.size) {
        return false;
    }
    for (let [key, val] of map) {
        testVal = this.get(key);
        // in cases of an undefined value, make sure the key
        // actually exists on the object so there are no false positives
        if (testVal !== val || (testVal === undefined && !this.has(key))) {
            return false;
        }
    }
    return true;
}

