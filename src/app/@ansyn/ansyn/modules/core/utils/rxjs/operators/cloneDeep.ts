import { Observable } from 'rxjs';
import { cloneDeep as _cloneDeep } from 'lodash';

export function cloneDeep() {
	return function cloneDeepImplementation(source) {
		return new Observable(subscriber => {
			const subscription = source.subscribe(value => {
					try {
						subscriber.next(_cloneDeep(value));
					} catch (err) {
						subscriber.error(err);
					}
				},
				err => subscriber.error(err),
				() => subscriber.complete());

			return subscription;
		});
	};
}
