import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { LoggerService } from '@ansyn/core/services/logger.service';
import 'rxjs/add/operator/do';

@Injectable()
export class LoggerAppEffects {
	@Effect({ dispatch: false })
	actionsLogger$ = this.actions$
		.do((action) => {
			this.loggerService.info(JSON.stringify(action));
		});

	constructor(public actions$: Actions, protected loggerService: LoggerService) {
	}
}
