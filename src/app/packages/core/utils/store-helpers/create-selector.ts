import { isEqual } from 'lodash';
import { Observable } from 'rxjs/Rx';
import { Store } from '@ngrx/store';

export function createSelector(store: Store<any>, reducer: string, key: string): Observable<any> {
	return store.select(reducer)
		.map((state: any) => state[key])
		.distinctUntilChanged(isEqual);
}
