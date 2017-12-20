import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { LoggerService } from '@ansyn/core/services/logger.service';
import 'rxjs/add/operator/do';
import { MapActionTypes } from '@ansyn/map-facade/actions/map.actions';


@Injectable()
export class LoggerAppEffects {

	@Effect({dispatch: false})
	actionsLogger$ = this.actions$
		.filter(action => action.type !== MapActionTypes.SET_PROGRESS_BAR)
		.do((action) => {
			// this.loggerService.info(action.type)
		});

	constructor(public actions$: Actions, protected loggerService: LoggerService) {
	}
}
