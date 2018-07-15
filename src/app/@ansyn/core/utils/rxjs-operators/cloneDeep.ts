import { Observable } from 'rxjs/Rx';
import { cloneDeep as _cloneDeep } from 'lodash';

export function cloneDeep() {
	// notice that we return a function here
	return function mySimpleOperatorImplementation(source) {
		return Observable.create(subscriber => {
			const subscription = source.subscribe(value => {
					try {
						console.log("yairtawil cloning deep!!!!")
						subscriber.next(_cloneDeep(value));
					} catch (err) {
						subscriber.error(err);
					}
				},
				err => subscriber.error(err),
				() => subscriber.complete());

			return subscription;
		});
	}
}
