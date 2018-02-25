import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/distinctUntilChanged';

export function createSelector(store: Store<any>, reducer: string, key: string): Observable<any> {
	return store.select(reducer)
		.map((state: any) => state[key])
		.distinctUntilChanged();
}
