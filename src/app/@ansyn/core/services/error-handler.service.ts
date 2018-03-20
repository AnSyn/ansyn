import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { SetToastMessageAction } from '@ansyn/core/actions/core.actions';
import { Observable } from 'rxjs/Observable';
import { LoggerService } from './logger.service';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
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
		return Observable.throw(errMsg);
	}

}
