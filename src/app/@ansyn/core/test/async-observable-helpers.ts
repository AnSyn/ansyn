// From https://angular.io/guide/testing

import { defer } from 'rxjs/observable/defer';
import { Observable } from 'rxjs';

/** Create a truly async observable that emits-once and completes
 *  after a JS engine turn */
export function asyncData<T>(data: T): Observable<T> {
	return defer(() => Promise.resolve(data));
}

/** Create a truly async observable error that errors
 *  after a JS engine turn */
export function asyncError<T>(errorObject: any): Observable<T> {
	return defer(() => Promise.reject(errorObject));
}
