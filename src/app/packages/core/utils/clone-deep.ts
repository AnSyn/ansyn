import { Observable } from 'rxjs';
import { cloneDeep } from 'lodash';

Observable.prototype.cloneDeep = function () {
	return this.do(
		nextValue => {
			return nextValue.map(data => cloneDeep(data));
		}
	)
};

declare module 'rxjs/Observable' {
	interface Observable<T> {
		cloneDeep: (...any) => Observable<T>
	}
}
