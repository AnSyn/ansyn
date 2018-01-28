import { Inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Response } from '@angular/http';
import { SetToastMessageAction } from '@ansyn/core/actions/core.actions';
import { Observable } from 'rxjs/Observable';
import { LoggerService } from './logger.service';

@Injectable()
export class ErrorHandlerService {

	constructor(protected store: Store<any>, public loggerService: LoggerService) {

	}

	public httpErrorHandle(error: Response | any, toastMessage?) {
		let errMsg: string;
		if (error instanceof Response) {
			errMsg = `${error.status} - ${error.statusText || ''}`;
		} else {
			errMsg = error.message ? error.message : error.toString();
		}
		this.loggerService.error(errMsg);
		this.store.dispatch(new SetToastMessageAction({
			toastText: toastMessage || "Connection Problem",
			showWarningIcon: true
		}));
		return Observable.throw(errMsg);
	}

}
