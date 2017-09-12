import { Observable } from 'rxjs/Observable';

const debuggerOn = true;

Observable.prototype.debug = function (message: string) {
	return this.do(
		nextValue => {
			if (debuggerOn) {
				console.log('Observer Debug-I: ' + message, (nextValue.type || nextValue));
			}
		},
		error => {
			if (debuggerOn) {
				console.error('Observer Debug-E: ' + message, (error));
			}
		},
		() => {
			console.error('Observer Debug-C: ' + message);
		}
	);
};

declare module 'rxjs/Observable' {
	interface Observable<T> {
		debug: (...any) => Observable<T>;
	}
}
;
