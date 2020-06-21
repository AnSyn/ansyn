import { EMPTY, OperatorFunction } from 'rxjs';
import { catchError } from 'rxjs/operators';

export function rxPreventCrash<T, R>(): OperatorFunction<T, T | R> {
	return catchError((err) => {
		console.warn(err);
		return EMPTY
	});
}
