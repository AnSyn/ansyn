import { EMPTY, OperatorFunction } from 'rxjs/index';
import { catchError } from 'rxjs/operators';

export function rxPreventCrash<T, R>(): OperatorFunction<T, T | R> {
	return catchError(() => EMPTY);
}
