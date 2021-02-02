import { Injectable } from '@angular/core';
import { LoggerService } from '../../modules/core/services/logger.service';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs';
import { filter, tap } from 'rxjs/operators';
import { actionHasLogMessage, getLogMessageFromAction } from '../../modules/core/utils/logs/timer-logs';

@Injectable()
export class LoggerAppEffects {

	@Effect({ dispatch: false })
	actionsLogger$: Observable<any> = this.actions$.pipe(
		filter((action) => actionHasLogMessage(action as any)),
		tap((action) => {
			this.loggerService.info(getLogMessageFromAction(action), 'Actions', action.type);
		}));

	constructor(
		protected actions$: Actions,
		protected loggerService: LoggerService
	) {
	}
}
