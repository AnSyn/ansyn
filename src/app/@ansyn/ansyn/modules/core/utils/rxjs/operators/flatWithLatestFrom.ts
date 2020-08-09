import { concatMap, withLatestFrom, tap } from 'rxjs/operators';
import { of, OperatorFunction, Observable } from 'rxjs';


/**
 * for performance reason is better to flat the withLatestFrom to prevent pre select.
 *
 * @see https://ngrx.io/guide/effects#incorporating-state
 */
export function flatWithLatestFrom(...selectors) {
	return concatMap( (action) => of(action).pipe(withLatestFrom(...selectors)))
}
