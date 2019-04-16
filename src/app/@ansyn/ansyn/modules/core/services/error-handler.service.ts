import { Inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { SetToastMessageAction } from '@ansyn/map-facade';
import { Observable, of, pipe, throwError, UnaryFunction } from 'rxjs';
import { LoggerService } from './logger.service';
import { CoreConfig } from '../models/core.config';
import { ICoreConfig } from '../models/core.config.model';
import { catchError, timeout } from 'rxjs/operators';


@Injectable()
export class ErrorHandlerService {

	constructor(protected store: Store<any>, public loggerService: LoggerService, @Inject(CoreConfig) public coreConfig: ICoreConfig) {

	}

	public httpErrorHandle<T = any>(error: any, toastMessage?: any, returnValue?: T): Observable<T> {
		let errMsg = error.message ? error.message : error.toString();
		this.loggerService.error(errMsg);

		if (toastMessage !== null) {
			this.store.dispatch(new SetToastMessageAction({
				toastText: toastMessage || 'Connection Problem',
				showWarningIcon: true
			}));
		}

		if (typeof returnValue === 'undefined') {
			return throwError(errMsg);
		} else {
			return of(returnValue);
		}
	}

	public handleTimeoutError(from?: string, time = this.coreConfig.httpTimeout): UnaryFunction<any, any> {
		return pipe(
			timeout(time),
			catchError((err) => {
				if (err.message === 'Timeout has occured') {
					const message = `${from} Requested time out after ${time}`;
					return throwError(message);
				}
				return throwError(err);
			})
		);
	}
}
