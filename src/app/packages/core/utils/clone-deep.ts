import { Observable } from 'rxjs';
import { cloneDeep } from 'lodash';

Observable.prototype.cloneDeep = function () {
	return this.do(
		nextValue => {
			return cloneDeep(nextValue);
		}
	)
};

declare module 'rxjs/Observable' {
	interface Observable<T> {
		cloneDeep: (...any) => Observable<T>
	}
}
