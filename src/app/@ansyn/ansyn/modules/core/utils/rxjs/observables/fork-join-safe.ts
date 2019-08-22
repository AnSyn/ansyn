import { forkJoin, Observable, of } from 'rxjs';

export function forkJoinSafe<T = any>(array: Observable<T>[]): Observable<T[]> {
	if (!array.length) {
		return of([])
	}
	return forkJoin(array);
}
