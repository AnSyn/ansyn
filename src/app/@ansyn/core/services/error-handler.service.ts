import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { SetToastMessageAction } from '../actions/core.actions';
import { Observable, throwError } from 'rxjs';
import { LoggerService } from './logger.service';

@Injectable()
export class ErrorHandlerService {

	constructor(protected store: Store<any>, public loggerService: LoggerService) {

	}

	public httpErrorHandle(error: any, toastMessage?) {
		let errMsg = error.message ? error.message : error.toString();
		this.loggerService.error(errMsg);
		this.store.dispatch(new SetToastMessageAction({
			toastText: toastMessage || "Connection Problem",
			showWarningIcon: true
		}));
		return throwError(errMsg);
	}

}
